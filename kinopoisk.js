'use strict';
var async = require('asyncawait/async');
var await = require('asyncawait/await');
var db = require('./dbAsync');
var web = require('./web');
//var needle = Promise.promisifyAll(require("needle"));
const BASE_URL = 'http://api.kinopoisk.cf/';

exports.getFilm = async(function (id) {
    var film = await(db.films.get(id));
    if (film) return film.id;
    var url = BASE_URL + 'getFilm?filmID=' + id;
    var body = await(web.getAsync(url));
    var kino = JSON.parse(body);
    if (!kino) {
        console.warn('Kinopoisk id not found in API', id);
        return null;
    }
    var film = {
        id: kino.filmID,
        name: kino.nameEN,
        nameRu: kino.nameRU,
        year: kino.year,
        desc: kino.description
    };
    var result = await(db.films.insert(film));
    return film.id;
});

