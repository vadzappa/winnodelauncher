var fs = require('fs'),
    path = require('path');

var mkdirsSync = function mkdirsSync(pathToMkDirs) {
    var normalizedPaths = path.normalize(pathToMkDirs),
        foldersToCreate = normalizedPaths.split(path.sep),
        nextFolder = [];
    while (foldersToCreate.length > 0) {
        nextFolder.push(foldersToCreate.shift());
        try {
            fs.mkdirSync(nextFolder.join(path.sep));
        } catch (e) {
        }
    }
};

module.exports = mkdirsSync;
