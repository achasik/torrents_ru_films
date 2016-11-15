'use strict';

var needle = require('needle');
var async = require('asyncawait/async');
//var md5 = require('blueimp-md5');



const KP_APIURL = 'https://ext.kinopoisk.ru/ios/3.11.0/';
const KP_SECRET = 'a17qbcw1du0aedm';
needle.defaults({ 
    //connection: 'Keep-Alive',
    user_agent: 'Android client (5.0 / api21), ru.kinopoisk/3.11.2 (27) (gzip)',
    open_timeout: 6000,
    headers: { 
        'device':'android',
        'Android-Api-Version':'22',
        'countryID':'2',
        //'ClientId': md5(Math.random() * 99999 + 1),
        'clientDate':new Date().toDateString(),
        'cityID':'2',
        'Image-Scale':'3',
        'Cache-Control':'max-stale=0',
        'Accept-Encoding':'gzip',
        'Cookie':'user_country=ru' 
    }
 });
var options ={
    headers: { 
        'device':'android',
        'Android-Api-Version':'22',
        'countryID':'2',
        //'ClientId': md5(Math.random() * 99999 + 1),
        'clientDate':new Date().toDateString(),
        'cityID':'2',
        'Image-Scale':'3',
        'Cache-Control':'max-stale=0',
        'Accept-Encoding':'gzip',
        'Cookie':'user_country=ru' 
    }
}
var getFilm = async(function (id) {
    var query = 'getKPFilmDetailView?kinopoiskId=999&uuid=b551edb50f87445ba338f307a2e6baee';
    var url =KP_APIURL+ query +'&key='+key(query);
    return new Promise(function (resolve, reject) {
        needle.get(url, options, function (err, resp, body) {
            if (err) {                
                console.error('Error getting url', url, err);
                return reject(err);
            }
            resolve(body);
        });
    });
})
exports.getFilm = getFilm;

function key(query){
    //return md5(query+KP_SECRET);
    return query+KP_SECRET;
}