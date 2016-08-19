'use strict';
var async = require('asyncawait/async');
var await = require('asyncawait/await');
var db = require('./dbAsync');
var web = require('./web');

const BASE_URL = 'http://api.kinopoisk.cf/';


var getFilm = async(function (id) {
    var film = await(db.films.get(id));
    if (film) return film;
    var url = BASE_URL + 'getFilm?filmID=' + id;
    var body = await(web.getAsync(url));
    if (!body) return null;
    var json = JSON.parse(body);
    var film = jsonToFilm(json);
    var result = await(db.films.insert(film));
    return film;
});
exports.getFilm = getFilm;

exports.search = async(function (torrent) {
    var possible = humanize(torrent.title);
    var film = searchLocal(possible);
    if (!film)
        film = await(searchApi(possible));
    return film;
});

var searchApi = async(function (possible) {
    var keyword = possible.nameEn ? possible.nameEn : possible.nameRU;
    if (!keyword) throw new Error('Keyword is null' + possible);
    var url = BASE_URL + 'searchGlobal?keyword=' + keyword;
    var body = await(web.getAsync(url));
    if (!body) return null;
    var json = JSON.parse(body);    
    var film;
    if (json.youmean) {
        film = jsonToFilm(json.youmean);
        if (filmsEqual(possible, film)) return getFilm(film.id);
    }    
    film = json.searchFilms.map(jsonToFilm).find(function(e){return filmsEqual(possible, e)});
    if (film) return getFilm(film.id);
    return null;
});
function filmsEqual(possible, film) {
    var equal = possible.nameEN && film.nameEN && possible.nameEN.toLowerCase() === film.nameEN.toLowerCase();
    equal = equal || (possible.nameRU && film.nameRU && possible.nameRU.toLowerCase() === film.nameRU.toLowerCase());
    var year = parseInt(possible.year);
    var year2 = parseInt(film.year);
    return equal && year <= year2 + 1 && year >= year2 - 1;
}
function jsonToFilm(json) {
    var film = {};
    if (json.id) film.id = json.id;
    if (json.filmID) film.id = json.filmID;
    film.nameEN = filmName(json.nameEN);
    film.nameRU = filmName(json.nameRU);
    film.year = json.year;
    film.description = json.description ? json.description : '';
    if (!film.id || (!film.nameEN && !film.nameRU) || !film.year)
        throw new Error('Json api wrong' + json);
    return film;
}
function searchLocal(possible) {
    return null;
}



function filmName(name) {
    if (!name) return name;
    return name.replace(/\s+\(.*?\)$/, '');
}
exports.humanize = humanize;
function humanize(title) {
    var result = {};
    title = title.replace(/^\[.*?\]\s+/, '');
    var names = head(title).split('/');
    result.nameRU = names[0].trim();
    result.nameEN = names.length > 1 ? names[names.length - 1].trim() : '';
    result.year = tail(title).match(/((19|20)\d{2})/)[1];
    return result;
}

function head(title) {
    return title.substring(0, splitPos(title));
}
function tail(title) {
    return title.substring(splitPos(title));
}
function splitPos(title) {
    var delims = ['[', '('];
    var pos = title.split('').findIndex(function (c) { return delims.indexOf(c) >= 0 });
    if (pos < 0) throw new Error('Splitter not found in' + title);
    return pos;
}

