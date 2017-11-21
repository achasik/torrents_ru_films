'use strict';

var async = require('asyncawait/async');
var asyncLimit = async.mod({ maxConcurrency: 1 });
var await = require('asyncawait/await');
//var _ = require('lodash');
var cheerio = require("cheerio");
var db = require('./dbAsync');
var web = require('./web');
var kinopoisk = require('./kinopoisk');



var getFeeds = asyncLimit(function (tracker) {
    tracker.feeds = await(db.feeds.get(tracker.id));
    tracker.feeds = await(tracker.feeds.map(getFeedEntries));
    return tracker;
});

var getFeedEntries = asyncLimit(function (feed) {
    var body = await(web.getAsync(feed.url));

    feed.torrents = web.xmlToTorrents(body, feed.trackerId);
    var count = feed.torrents.length;
    //console.log('Torrents found', count, feed.url);

    feed.torrents = await(feed.torrents.filter(function (torrent) { return !await(db.torrents.get(torrent.trackerId, torrent.id)) }));
    feed.torrents = await(feed.torrents.filter(function (torrent) { return !await(db.notfound.get(torrent.trackerId, torrent.id)) }));
    //console.log('Removed existing torrents', count - feed.torrents.length, feed.url);
    console.log('New torrents found:', feed.torrents.length, feed.url);
    feed.torrents = await(feed.torrents.map(getTorrent));
    //await(db.feeds.update(feed.id));
    return feed;
});
var getTorrent = asyncLimit(function (torrent) {
    //var body = torrent.description; 
    var body = await(web.getAsync(torrent.url));
    var $ = cheerio.load(body);
    var magnet = $('a[href*="magnet"]').attr('href');
    if (!magnet && torrent.trackerId===3)
        magnet = await(web.getKinozalMagnet(torrent));
    if (!magnet) {
        torrent.magnet ='notfound';
        console.warn('magnet not Found', torrent.url);
        await(db.notfound.insert(torrent));
        return torrent;
    }
    torrent.magnet = magnet;
    var link = $('a[href*="kinopoisk"]').attr('href');
    var re = /film\/(\d+)\/?/
    if (link && re.test(link)) {
        let id = re.exec(link)[1];
        let film = await(kinopoisk.getFilm(id,torrent));
        if (film) torrent.kinopoisk = film.id;
    } else {
        let film = await(kinopoisk.search(torrent));
        if (film) torrent.kinopoisk = film.id;
    }
    torrent.title = web.sanitize(torrent.title);
    if (torrent.kinopoisk && torrent.magnet) {
        await(db.torrents.insert(torrent));
        await(db.films.update(torrent.kinopoisk));
        return null;
    }
    console.warn('Kinopoisk id not found', torrent.url, JSON.stringify(kinopoisk.humanize(torrent)));
    await(db.notfound.insert(torrent));
    return torrent;
});

var run = async(function () {
    var lastUpdate = await(db.films.lastUpdate()).result;
    var torrentsWas = await(db.torrents.total()).result;
    var notFoundWas = await(db.notfound.total()).result;
    var trackers = await(db.trackers());
    trackers = await(trackers.map(getFeeds));
    var torrentsNow = await(db.torrents.total()).result;
    var updated = await(db.films.updated(lastUpdate)).result;
    var notFoundNow = await(db.notfound.total()).result;
    console.log('Films updated', updated);
    console.log('Torrents updated', torrentsNow - torrentsWas);
    console.log('Torrents not found', notFoundNow - notFoundWas);
    return trackers;
});


let script = process.env.MORPH_SCRIPT
if (script) {
    db.init(script);
}
   
run()
    .then(function () { db.close() })
    .then(function () { console.log('DONE') })
    .catch(function (err) { console.error(err); });


