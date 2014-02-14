var fs = require('fs'),
    configReader = require('./configReader'),
    path = require('path'),
    Log = require('log'),
    _ = require('lodash'),
    Writable = require('stream').Writable,
    defaultStream = new Writable({
        decodeStrings: false
    }),
    logBuffer = '';

_.mixin(require('underscore.deferred'));


_.extend(defaultStream, {
    _write: function (data, encoding, cb) {
        logBuffer += data;
        console.log(logBuffer);
        cb();
    }
});

var log = new Log('debug', defaultStream);

_.when(configReader.getConfig()).then(function (config) {
    try {
        fs.mkdirSync(config.configuration.logfolder);
        var logFilePath = path.join(config.configuration.logfolder, 'launcher.log');
        console.log(logFilePath);
        var fileWriterStream = fs.createWriteStream(logFilePath, {
            flags: 'a+'
        });
        defaultStream.end();
        fileWriterStream.write(logBuffer);
        log = new Log('debug', fileWriterStream);
    } catch (e) {
        console.error(e);
    }
});

module.exports = log;