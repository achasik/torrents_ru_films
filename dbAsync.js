'use strict';

var async = require('asyncawait/async');
var await = require('asyncawait/await');
var Promise = require('bluebird');
const fs = require("fs");
var sqlite3 = Promise.promisifyAll(require('sqlite3').verbose());
var _db = _db || new sqlite3.Database("data.sqlite");

exports.close = function () {
    _db.close();
};
exports.init = function () {
    console.log('Init DB');
    var sql = fs.readFileSync('./init.sql', 'utf8');
    _db.exec(sql, function (err) {
        if (err) {
            console.log(err);
            throw err;
        }
        _db.close();
        console.log('Init Done');
    });
}
exports.initAsync = async(function () {
    console.log('Init DB');
    var sql = fs.readFileSync('./init.sql', 'utf8');
    var result = await(_db.execAsync(sql));
    console.log('Init Done');
});

exports.trackers = async(function () {
    return _db.allAsync('SELECT * FROM trackers WHERE active');
});

exports.feeds = {
    get: async(function (trackerId) {
        return _db.allAsync('SELECT * FROM feeds WHERE trackerId=? AND active', trackerId);
    }),
    update: async(function (id) {
        return _db.runAsync("UPDATE feeds SET updated=strftime('%s','now') WHERE id=?", [id]);
    }),
}

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
        return _db.runAsync("INSERT INTO films(id,name,nameRu,year,description,updated) VALUES(?,?,?,?,?,strftime('%s','now'))",
            [film.id, film.nameEN, film.nameRU, film.year, film.description]);
    })
}



