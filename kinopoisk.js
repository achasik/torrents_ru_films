'use strict';
var async = require('asyncawait/async');
var asyncLimit = async.mod({ maxConcurrency: 1 });
var await = require('asyncawait/await');
var db = require('./dbAsync');
var web = require('./web');
var he = require('he');
var cheerio = require('cheerio');
//var diacritics = require('./diacritics');
const BASE_URL = 'http://api.kinopoisk.cf/';


var getFilm = async(function (id, torrent) {
    var film = await(db.films.get(id));
    if (film) return film;
    film = humanize(torrent);
    film.id = id;
    var result = await(db.films.insert(film));
    return film;
    //film = 
    /*
    var url = BASE_URL + 'getFilm?filmID=' + id + '&rand=' + Math.floor((Math.random() * 1000) + 1);
    var json = await(web.getJson(url));
    if (!json) {
        console.warn("Kinopoisk api not found", id);
        return null;
    }
    var film = jsonToFilm(json);
    if (!film) return null;
    var result = await(db.films.insert(film));
    return film;
    */
});
exports.getFilm = getFilm;

exports.search = asyncLimit(function (torrent) {
    //var possible = humanize(torrent);
    var film = await(searchLocal(torrent));
    if (!film)
        film = await(searchHtml(torrent));
    return film;
});
var searchHtml = async(function (torrent, findRu){
    let possible = humanize(torrent);
    var keyword = possible.nameEN || possible.nameRU;
    if (findRu && possible.nameRU) keyword = possible.nameRU;
    if (!keyword) throw new Error('Keyword is null' + possible);
    keyword = keyword.split(' ').join('+');
    keyword = encodeURI(keyword);
    var url = "https://m.kinopoisk.ru/search/"+keyword+"/";
    var html = await(web.getAsync(url));
    let $ =  cheerio.load(html);
    var youmean = null;
    var films =[];
    $('div[class="block search"]').each(function(i,e){
        if($(e).children('p').text().startsWith('Скорее'))
            youmean = jsonToFilm(spanToFilm($(e).children('span').first()));
        else if($(e).children('p').text().startsWith('Похожие'))
            films = $(e).children('span').map(function(i,e){
                return jsonToFilm(spanToFilm($(e)));
            });
    });   
    if(youmean && filmsEqual(possible, youmean))
        return youmean;
    let film = films.find(function (f) { return filmsEqual(possible, f) });
    if (film) return film;
    if (!findRu && possible.nameRU) return searchApi(torrent, true);
    return null;    
});
exports.searchHtml = searchHtml;
function spanToFilm(span){
    let a = span.children('a');
    if (a.text().startsWith('показать всё'))
        return null;    
    let href = a.attr('href');
    let id = href.match(/(\d+)/)[1];
    let arr = a.text().split(',');
    let nameRU = arr.slice(0,arr.length-1).join(',');
    let year = arr.length >1 ? arr[arr.length-1].trim() : '1900';
    arr = span.html().split('<br>');
    let nameEN = arr.length>1 ? arr[1].trim().replace('&#xA0;','') : '';
    return {
        'id': id,
        'nameRU': nameRU,
        'nameEN': nameEN,
        'year': year
    };
}

var searchApi = async(function (torrent, findRu) {
    let possible = humanize(torrent);
    var keyword = possible.nameEN || possible.nameRU;
    if (findRu && possible.nameRU) keyword = possible.nameRU;
    if (!keyword) throw new Error('Keyword is null' + possible);
    keyword = keyword.split(' ').join('+');
    keyword = encodeURI(keyword);
    //keyword = he.encode(keyword);
    //var url = BASE_URL + 'searchGlobal?keyword=' + keyword + '&rand=' + Math.floor((Math.random() * 1000) + 1);
    var url = BASE_URL + 'searchFilms?keyword=' + keyword + '&rand=' + Math.floor((Math.random() * 1000) + 1);
    var json = await(web.getJson(url)) || {};
    if (json.youmean && json.youmean.type === 'KPFilm') {
        let film = jsonToFilm(json.youmean);
        if (filmsEqual(possible, film)) return getFilm(film.id);
    }
    var films = json.searchFilms || []
    var film = films
        .filter(function (e) { return e.type === 'KPFilm' })
        .map(jsonToFilm)
        .find(function (e) { return filmsEqual(possible, e) });
    if (film) return getFilm(film.id);
    if (!findRu && possible.nameRU) return searchApi(torrent, true);
    return null;
});
exports.searchApi = searchApi;

function filmsEqual(possible, film) {
    if (!possible || !film) return false;
    var equal = compareNames(possible.nameEN, film.nameEN);
    equal = equal || compareNames(possible.nameRU, film.nameRU);
    var year = parseInt(possible.year);
    var year2 = parseInt(film.year);
    return equal && year <= year2 + 1 && year >= year2 - 1;
}
function compareNames(name1, name2) {
    if (!name1 || !name2) return false;
    return name1.toLowerCase() === name2.toLowerCase();
}
function jsonToFilm(json) {
    if(!json) return null;
    var film = {};
    if (json.id) film.id = parseInt(json.id);
    if (json.filmID) film.id = parseInt(json.filmID);
    if(json.nameEN)
        film.nameEN = web.sanitize(json.nameEN).replace(/\s+\(.*?\)$/, '');
    if(json.nameRU)
        film.nameRU = web.sanitize(json.nameRU).replace(/\s+\(.*?\)$/, '');
    if (!film.nameEN && !isRu(film.nameRU)) {
        film.nameEN = film.nameRU;
        film.nameRU = '';
    }
    film.year = parseInt(json.year);
    film.description = json.description ? web.sanitize(json.description) : '';
    if (!film.id || (!film.nameEN && !film.nameRU) || !film.year) {
        //console.warn('Json api wrong' + JSON.stringify(film));
        return null;
    }
    return film;
}
var searchLocal = async(function (torrent) {
    let possible = humanize(torrent);
    //var result = await(db.films.search(possible));
    //if (result) console.log('Found local', result.id);
    return db.films.search(possible);
    //return result;
})
function isRu(str) {
    return /а|е|и|у|о|ы|э|я|ю/.test(str);
}
function filmName(name) {
    if (!name) return name;
    return web.diacriticsReplace(name.replace(/\s+\(.*?\)$/, ''));
}
exports.humanize = humanize;
function humanize(torrent) {
    var title = torrent.title;
    var result = {};
    title = title.replace(/^\[.*?\]\s+/, '');
    //var split = splitPos(title);
    if (torrent.trackerId != 3) {
        let names = head(title).split('/');
        result.nameRU = web.sanitize(names[0].trim());
        result.nameEN = names.length > 1 ? web.sanitize(names[names.length - 1].trim()) : '';
        result.year = /((19|20)\d{2})/.test(tail(title)) ? tail(title).match(/((19|20)\d{2})/)[1] : 1900;
    } else {
        let names = title.split('/');
        result.nameRU = web.sanitize(names[0].trim());
        if (names.length > 1) result.nameEN = web.sanitize(names[1].trim());
        if (result.nameEN && (isRu(result.nameEN) || /^(19|20)\d{2}$/.test(result.nameEN)))
            result.nameEN = ''
        result.year = /((19|20)\d{2})/.test(title) ? title.match(/((19|20)\d{2})/)[1] : 1900;
    }
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
    //if (pos < 0) throw new Error('Splitter not found in' + title);
    return pos;
}

