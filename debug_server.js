var express = require('express'),
    app = express(),
    http = require("http"),
    path = require("path"),
    workingFolder = path.join(__dirname, '/application');

// simple logger
app.use(function (req, res, next) {
    console.log('%s %s', req.method, req.url);
    next();
});

// respond
app.use(function (req, res, next) {
//    res.sendfile(path.join(__dirname, "/zag.gif"));
    if (req.path === '/') {
        res.sendfile(path.join(workingFolder, '/index.html'));
    } else {
        res.sendfile(path.join(workingFolder, req.path));
    }

});

http.createServer(app).listen(80, function () {
    console.log("Express server listening on port " + 80);
});

/*https.createServer(options, app).listen(3000, function () {
 console.log("Express server listening on port " + 3000);
 });*/


module.exports = {};