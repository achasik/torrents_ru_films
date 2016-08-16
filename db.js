'use strict'

const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");
let db = null;
db = db || new sqlite3.Database("data.sqlite");

exports.close = function (callback) {
    db.close();
}
exports.init = function (callback) {
    var sql = fs.readFileSync('./init.sql', 'utf8');
    db.serialize(function () {
        /*sql.split(';').forEach(function (stmt) {
            db.run(stmt, function (err) {
                if (err) throw err;
            })
        });*/
        db.exec(sql, function (err) {
            if (err) throw err;
            if (callback) callback();
        })
    });
}
exports.getTrackers = function (callback){
    db.all('SELECT * FROM trackers WHERE active', [], function (err, rows) {
        if (err) return callback(err, []);
        callback(null, rows);
    });
}
exports.getFeeds = function (tracker, callback) {
    db.all('SELECT * FROM feeds WHERE trackerId=? AND active', [tracker.id], function (err, rows) {
        if (err) return callback(err, tracker);
        tracker.feeds = rows;
        callback(null, tracker);
    });
}

