var needle = require("needle");
var Promise = require('bluebird');

exports.getAsync = function(url){
    return new Promise(function(resolve,reject){
        needle.get(url, function (err, resp, body) {
            if (err){
                console.error('Error getting url', url, err);
                return reject(err);
            } 
            resolve(body);
        });
    });
    
}
