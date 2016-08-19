'use strict';

var async = require('asyncawait/async');
var asyncLimit = async.mod({maxConcurrency: 2})
var await = require('asyncawait/await');
var _ = require('lodash');
var cheerio = require("cheerio");
var db = require('./dbAsync');
var web = require('./web');
var kinopoisk = require('./kinopoisk');


var getFeeds = async(function (tracker) {
    tracker.feeds = await(db.feeds.get(tracker.id));
    tracker.feeds = await(_.map(tracker.feeds, getFeedEntries));
    return tracker;
});

var getFeedEntries = async(function (feed) {
    var body = await(web.getAsync(feed.url));
    if (!body.feed || !body.feed.entry || body.feed.entry.length === 0) {
        console.warn("Wrong feed format or no entries " + feed.url);
        return feed;
    }    
    if (feed.updated && Date.parse(body.feed.updated)/1000< feed.updated ){
        console.log ("Feed is up to date", feed.url);
        return feed;
    }   
    feed.torrents = _.map(body.feed.entry, function (entry) {
        return {
            trackerId: feed.trackerId,
            id: entry.link.$.href.match(/t=(\d+)/)[1],
            title: entry.title._,
            url: entry.link.$.href.replace('.org', '.net')
        }
    });
    var count = feed.torrents.length;
    console.log('Torrents found', count, feed.url);

    feed.torrents = await(_.filter(feed.torrents, function (torrent) { return !await(db.torrents.get(torrent.trackerId, torrent.id))}));
    console.log('Removed existing torrents',  count - feed.torrents.length, feed.url);
    
    feed.torrents = await(_.map(feed.torrents, getTorrent));
    //await(db.feeds.update(feed.id));
    return feed;
});
var getTorrent = asyncLimit(function (torrent) {
    var body = await(web.getAsync(torrent.url));
    var $ = cheerio.load(body);
    var magnet = $('a[href*="magnet"]').attr('href');
    if (!magnet)
        console.warn('magnet not Found', torrent.url);
    else
        torrent.magnet = magnet;
    var link = $('a[href*="kinopoisk"]').attr('href');
    if (link) {
        let id = link.match(/film\/(\d+)\//)[1];        
        let film = await (kinopoisk.getFilm(id));
        if (film) torrent.kinopoisk = film.id;
    }else{
        let film = await(kinopoisk.search(torrent));
        if(film) torrent.kinopoisk = film.id;
    }
    if (torrent.kinopoisk){
        await(db.torrents.insert(torrent));
        await(db.films.update(torrent.kinopoisk));
        return null;
    }
    console.warn('Kinopoisk id not found', torrent.url, JSON.stringify(kinopoisk.humanize(torrent.title)));
    return torrent;
});

var run = async(function () {
    if(process.env.MORPH_DBINIT==='1')
        await(db.init());
    //var trackers = await(db.trackers());
    //trackers = await(_.map(trackers, getFeeds));
    //db.close(function(){ console.log('DONE');});
    //return trackers;
});

 
run()
    .then(function(){db.close()})
    .then(function(){console.log('DONE')})
    .catch(function (err) { console.error(err); });
