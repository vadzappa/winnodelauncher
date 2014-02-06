var fs = require('fs'),
    path = require('path'),
    Log = require('log'),
    log = new Log('debug', fs.createWriteStream(path.normalize('c:\\launcher.log'), {
        flags: 'a+'
    }));

module.exports = log;