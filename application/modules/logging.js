var fs = require('fs'),
    configReader = require('./configReader'),
    mkDirsSync = require('./dirsmaker'),
    path = require('path'),
    Log = require('log'),
    _ = require('lodash'),
    Writable = require('stream').Writable,
    defaultStream = new Writable({
        decodeStrings: false
    }),
    logBuffer = '',
    appConfig = undefined;

_.mixin(require('underscore.deferred'));


_.extend(defaultStream, {
    _write: function (data, encoding, cb) {
        var writtenData = data.toString(encoding);
        try {
            if (!appConfig) {
                logBuffer += writtenData;
                console.log(writtenData);
                cb();
            } else {
                if (logBuffer) {
                    appConfig.fileStream.write(logBuffer, encoding, function () {
                        logBuffer = undefined;
                        appConfig.fileStream.write(data, encoding, cb);
                    });
                } else {
                    appConfig.fileStream.write(data, encoding, cb);
                }
            }
        } catch (e) {
        }
    }
});

defaultStream.on('finish', function () {
    if (appConfig) {
        appConfig.fileStream.end();
    }
});

var log = new Log('debug', defaultStream);

_.when(configReader.getConfig()).then(function (config) {
    try {
        mkDirsSync(config.configuration.logfolder);
        var logFilePath = path.join(config.configuration.logfolder, 'launcher.log');
        appConfig = {
            config: config,
            filePath: logFilePath,
            fileStream: fs.createWriteStream(logFilePath, {
                flags: 'a+',
                encoding: 'utf-8'
            })
        };
    } catch (e) {
        console.error(e);
    }

});

module.exports = log;