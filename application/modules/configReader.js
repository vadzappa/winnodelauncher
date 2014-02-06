var fs = require('fs'),
    _ = require('lodash');

_.mixin(require('underscore.deferred'));

var getConfig = function getConfig() {
    var deferred = new _.Deferred();
    fs.readFile('./launcher-config.json', 'utf-8', function (error, contents) {
        if (error) {
            deferred.resolve({});
        } else {
            deferred.resolve(JSON.parse(contents));
        }
    });
    return deferred.promise();
};
module.exports = {getConfig: getConfig};