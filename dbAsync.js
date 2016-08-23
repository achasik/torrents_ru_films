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
    //console.log(sql);
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
    total: async(function(){
        return _db.getAsync('SELECT COUNT(id) AS result FROM torrents');
    }),
    get: async(function (trackerId, id) {
        return _db.getAsync('SELECT * FROM torrents WHERE trackerId=? AND id=?', [trackerId, id]);
    }),
    insert: async(function (torrent) {
        return _db.runAsync("INSERT INTO torrents (trackerId,id,kinopoisk,title,url,magnet) VALUES(?,?,?,?,?,?)",
            [torrent.trackerId, torrent.id, torrent.kinopoisk, torrent.title, torrent.url, torrent.magnet]);
    })
}
exports.notfound = {
    total: async(function(){
        return _db.getAsync('SELECT COUNT(id) AS result FROM notfound');
    }),
    get: async(function (trackerId, id) {
        return _db.getAsync('SELECT * FROM notfound WHERE trackerId=? AND id=?', [trackerId, id]);
    }),
    insert: async(function (torrent) {
        return _db.runAsync("INSERT INTO notfound (trackerId,id,title,url,magnet) VALUES(?,?,?,?,?)",
            [torrent.trackerId, torrent.id, torrent.title, torrent.url, torrent.magnet]);
    })
}
exports.films = {
    lastUpdate: async (function(){
        return _db.getAsync('SELECT MAX(updated) AS result FROM films');
    }),
    updated: async (function(last){
        return _db.getAsync('SELECT COUNT(updated) AS result FROM films WHERE updated>?',[last]);
    }),
    get: async(function (id) {
        return _db.getAsync('SELECT * FROM films WHERE id=?', [id]);
    }),
    update: async(function (id) {
        return _db.runAsync("UPDATE films SET updated=strftime('%s','now') WHERE id=?", [id]);
    }),
    insert: async(function (film) {
        return _db.runAsync("INSERT OR REPLACE INTO films(id,name,nameRu,year,description,updated) VALUES(?,?,?,?,?,strftime('%s','now'))",
            [film.id, film.nameEN, film.nameRU, film.year, film.description]);
    }),
    search: async(function(film){
        return _db.getAsync("SELECT * FROM films WHERE ((name IS NOT NULL AND lower(name)=lower(?)) OR (nameRu IS NOT NULL AND lower(nameRu)=lower(?))) AND year BETWEEN ? AND ?",
        [film.nameEN, film.NameRu, film.year-1, film.year+1]);
    } )
}



