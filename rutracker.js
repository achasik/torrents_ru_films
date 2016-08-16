'use strict'
const RSS_BASE_URL = 'http://feed.rutracker.cc/atom/f/';
const FEEDS = ['2200', '187', '9999'];
const TRACKER_ID = '1';

var async = require('async');
var needle = require("needle");
var cheerio = require("cheerio");
var db = require('./db');

exports.test = function (callback) {
    async.map(FEEDS, processFeed, done);    
}

function processFeed(feed, cb) {
    async.waterfall([
        async.apply(getEntries, feed),
        //processEntries,
        myLastFunction,
    ], cb);
}
function done(err, result, callback) {
    if (err)
        console.error(err);
    else
        console.log('Done', result);
    db.close();
}
function getEntries(feed, callback) {
    var url = RSS_BASE_URL + feed + ".atom";
    console.log("Processing feed", url);
    needle.get(url, function (err, resp, body) {
        if (err)
            return callback(err);
        if (!body.feed || !body.feed.entry || body.feed.entry.length === 0){
            console.warn("Wrong feed format or no entries " + url);
            return callback(null,[]);
        }
            
        if (feedUpdated(feed, body.feed.updated))
            return callback("Feed already updated " + url);
        var entries = body.feed.entry.map(function (entry) {
            return {
                tracker: TRACKER_ID,
                title: entry.title._,
                link: entry.link.$.href.replace('.org','.net'),
                feed: feed,
                id: entry.link.$.href.match(/t=(\d+)/)[1]
            }
        });
        console.log("Feed processed", url);
        return callback(null, entries);
    });
}
function processEntries(entries, callback) {
    console.log('Found entries', entries.length);
    async.mapLimit(entries, 2, processEntry, callback)
    //callback(null, 'three');
}
function processEntry(entry, callback) {
    //console.log('Getting', entry.link, entry.feed)
    needle.get(entry.link, function (err, resp, body) { 
        if (err) return callback(err);
        var $ = cheerio.load(body);
        var magnet =$('a[href*="magnet"]').attr('href');
        if (!magnet)
            console.warn('magnet not Found',entry.link);
        var kinopoisk =$('a[href*="kinopoisk"]').attr('href');
        if (kinopoisk)
            console.warn('kinopoisk Found',entry.link, entry.feed);
        callback();
    });
    

}
function myLastFunction(arg1, callback) {
    console.log('Last', arguments);
    callback(null, 'done');
}
function feedUpdated(feed, date) {
    var dt = Date.parse(date);
    return false;
}
