'use strict';

var async = require('asyncawait/async');
var await = require('asyncawait/await');
var Promise = require('bluebird');
const fs = require("fs");
var sqlite3 = Promise.promisifyAll(require('sqlite3').verbose());
var _db = _db || new sqlite3.Database("data.sqlite");

exports.close = function (callback) {
    _db.close();
    if (callback) callback();
}

exports.init = async(function () {
    var sql = fs.readFileSync('./init.sql', 'utf8');
    var result = await(_db.execAsync(sql));
});

exports.trackers = async(function () {
    return _db.allAsync('SELECT * FROM trackers WHERE active');
});

exports.feeds = async(function (trackerId) {
    return _db.allAsync('SELECT * FROM feeds WHERE trackerId=? AND active', trackerId);
});

exports.torrents = {
    get: async(function (trackerId, id) {
        return _db.getAsync('SELECT * FROM torrents WHERE trackerId=? AND id=?', [trackerId, id]);
    }),
    insert: async(function (torrent) {
        return _db.runAsync("INSERT INTO torrents (trackerId,id,kinopoisk,title,url,magnet) VALUES(?,?,?,?,?,?)",
            [torrent.trackerId, torrent.id, torrent.kinopoisk, torrent.title, torrent.url, torrent.magnet]);
    })
}

exports.films = {
    get: async(function (id) {
        return _db.getAsync('SELECT * FROM films WHERE id=?', [id]);
    }),
    update: async(function (id) {
        return _db.runAsync("UPDATE films SET updated=strftime('%s','now') WHERE id=?", [id]);
    }),
    insert: async(function (film) {
        return _db.runAsync("INSERT INTO films(id,name,nameRu,year,desc,updated) VALUES(?,?,?,?,?,strftime('%s','now'))",
            [film.id, film.name, film.nameRu, film.year, film.desc]);
    })
}



