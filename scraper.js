// This is a template for a Node.js scraper on morph.io (https://morph.io)

//var cheerio = require("cheerio");
//var request = require("request");
//var needle = require("needle");
var rutracker = require('./rutracker');
var async = require('async');
var db = require('./db');
//var sqlite3 = require("sqlite3").verbose();
//global._db = new sqlite3.Database("data.sqlite");

function initDatabase(callback) {
	// Set up sqlite database.
	var db = new sqlite3.Database("data.sqlite");
	db.serialize(function () {
		db.run("CREATE TABLE IF NOT EXISTS data (name TEXT)");
		callback(db);
	});
}

function updateRow(db, value) {
	// Insert some data.
	var statement = db.prepare("INSERT INTO data VALUES (?)");
	statement.run(value);
	statement.finalize();
}

function readRows(db) {
	// Read some data.
	db.each("SELECT rowid AS id, name FROM data", function (err, row) {
		console.log(row.id + ": " + row.name);
	});
}

function fetchPage(url, callback) {
	// Use request to read in pages.
	request(url, function (error, response, body) {
		if (error) {
			console.log("Error requesting page: " + error);
			return;
		}
		callback(body);
	});
}


function run(db) {
	// Use request to read in pages.
	fetchPage("https://morph.io", function (body) {
		// Use cheerio to find things in the page with css selectors.
		var $ = cheerio.load(body);

		var elements = $("div.media-body span.p-name").each(function () {
			var value = $(this).text().trim();
			updateRow(db, value);
		});

		readRows(db);

		db.close();
	});
}

//initDatabase(run);
/*
function fetchRss(url, callback){
	needle.get(url,function(err, resp, body){
		if (err) throw err;
		var a = body;
	});	
}*/
//db.clear();
function done(err, result) {	
	db.close();
	err ? console.error(err) : console.log(result);
	console.log("scraper exit");
}

function getFeeds(trackers, callback){
	return async.map(trackers, db.getFeeds, callback);
}
function scrape(callback) {
	async.waterfall([
		db.getTrackers,
		getFeeds
	], callback);
}
//db.init(done);
scrape(done);

