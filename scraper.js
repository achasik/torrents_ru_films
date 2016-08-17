'use strict';

var async = require('asyncawait/async');
var await = require('asyncawait/await');
var _ = require('lodash');
var cheerio = require("cheerio");
var db = require('./dbAsync');
var web = require('./web');
var kinopoisk = require('./kinopoisk');

var getFeeds = async(function (tracker) {
    //tracker.feeds = await(db.allAsync('SELECT * FROM feeds WHERE trackerId=? AND active', tracker.id));
    tracker.feeds = await(db.feeds(tracker.id));
    tracker.feeds = await(_.map(tracker.feeds, getFeedEntries));
    return tracker;
});

var getFeedEntries = async(function (feed) {
    var body = await(web.getAsync(feed.url));
    if (!body.feed || !body.feed.entry || body.feed.entry.length === 0) {
        console.warn("Wrong feed format or no entries " + feed.url);
        return feed;
    }
    if (feed.updated && feed.updated >= Date.parse(body.feed.updated))
        return feed;
    feed.torrents = _.map(body.feed.entry, function (entry) {
        return {
            trackerId: feed.trackerId,
            id: entry.link.$.href.match(/t=(\d+)/)[1],
            title: entry.title._,
            url: entry.link.$.href.replace('.org', '.net')
        }
    });
    feed.torrents = await(_.filter(feed.torrents, function (torrent) { return db.torrents.get(torrent.trackerId, torrent.id); }));
    feed.torrents = await(_.map(feed.torrents, getTorrent));
    return feed;
});
var getTorrent = async(function (torrent) {
    var body = await(web.getAsync(torrent.url));
    var $ = cheerio.load(body);
    var magnet = $('a[href*="magnet"]').attr('href');
    if (!magnet)
        console.warn('magnet not Found', torrent.url);
    else
        torrent.magnet = magnet;
    var link = $('a[href*="kinopoisk"]').attr('href');
    if (link) {
        var id = link.match(/film\/(\d+)\//)[1];        
        id = await (kinopoisk.getFilm(id));
        if (id) torrent.kinopoisk = id;
    }
    if (torrent.kinopoisk){
        await(db.torrents.insert(torrent));
        await(db.films.update(torrent.kinopoisk));
    }
    return torrent;
});

var test = async(function () {
    await(db.init());
    var trackers = await(db.trackers());
    trackers = await(_.map(trackers, getFeeds));
    return trackers;
});

test()
    .then(function (result) { console.log(result); })
    .then(db.close)
    .catch(function (err) { console.error(err); });
