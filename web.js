var needle = require("needle");
var async = require('asyncawait/async');
var await = require('asyncawait/await');
var Promise = require('bluebird');
var he = require('he');
var diacritics = require('./diacritics');

needle.defaults({ 
    connection: 'Keep-Alive',
    user_agent: 'Mozilla/5.0 (Windows NT 6.3; WOW64; rv:36.0) Gecko/20100101 Firefox/36.0',
    follow: 2
 });

exports.getAsync = getAsync;
exports.getJson = getJson;
//exports.getJsonWithRetry = getJsonWithRetry;
exports.xmlToTorrents = xmlToTorrents;
exports.decode = myDecode;
//exports.diacriticsReplace = diacriticsReplace;
exports.sanitize = sanitize;

function getAsync(url, retry) {
    return new Promise(function (resolve, reject) {
        needle.get(url, function (err, resp, body) {
            if (err) {
                if(!retry) return getAsync(url, true);
                console.error('Error getting url', url, err);
                return reject(err);
            }
            resolve(body);
        });
    });
}
/*
exports.getJson = async(function(url){
    var body = await(getAsync(url));
    if(body) return JSON.parse(body);
    return null; 
});
*/
function getJson(url, retry) {
    return new Promise(function (resolve, reject) {
        needle.get(url, function (err, resp, body) {
            if (err) {
                if(!retry) return resolve(null);
                console.error('Error getting url', url, err);
                return reject(err);
            }
            resolve(JSON.parse(body));
        });
    });
}
exports.getJsonWithRetry = async(function (url) {
    var json = await(getJson(url));
    if (json) return json;
    return getJson(url,true);
});
function xmlToTorrents(xml, trackerId) {
    var torrents = [];
    if (xml.feed) {
        torrents = xml.feed.entry.map(function (entry) {
            return {
                trackerId: trackerId,
                id: entry.link.$.href.match(/t=(\d+)/)[1],
                title: entry.title._.trim(),
                url: entry.link.$.href.replace('.org', '.net')                
            }
        });
    }else if(xml.rss){
        torrents = xml.rss.channel.item.map(function (entry) {
            return {
                trackerId: trackerId,
                id: entry.link.match(/(\d+)/)[1],
                title: entry.title.trim(),
                url: entry.link,
                description: entry.description
            }
        });
    }
    return torrents;
}
function myDecode(str) {
    return he.decode(str);
}
function diacriticsReplace(str) {
    return diacritics.replace(str);
}
function sanitize(str) {
    var result = str.replace(/[l|la]*'|[l|la]*&#039;/ig, '').trim();
    //result = result.replace(/l'/ig, '');
    result = result.replace(/la /ig, ' ').trim();
    //result = result.replace('la ', ' ');
    result = myDecode(result);
    result = diacriticsReplace(result);
    result = result.replace(/\s+/g, ' ').trim();
    return result.charAt(0).toUpperCase() + result.slice(1);
}


