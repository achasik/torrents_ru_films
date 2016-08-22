var needle = require("needle");
var Promise = require('bluebird');
var he = require('he');
var diacritics = require('./diacritics');
needle.defaults({connection: 'Keep-Alive'});
exports.getAsync = getAsync; 
exports.getJson = getJson;

function getAsync(url) {
    return new Promise(function (resolve, reject) {
        needle.get(url, function (err, resp, body) {
            if (err) {
                console.error('Error getting url', url, err);
                return reject(err);
            }
            resolve(body);
        });
    });
}
function getJson(url){
    return new Promise(function (resolve, reject) {
        needle.get(url, function (err, resp, body) {
            if (err) {
                console.error('Error getting url', url, err);
                return reject(err);
            }
            resolve(JSON.parse(body));
        });
    });
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
    result = result.replace(/\s+/g,' ').trim();
    return result.charAt(0).toUpperCase() + result.slice(1);
}
exports.decode = myDecode;
exports.diacriticsReplace = diacriticsReplace;
exports.sanitize = sanitize;

