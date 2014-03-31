var fs = require('fs'),
    _ = require('lodash'),
    dirsmaker = require('./dirsmaker'),
    path = require('path'),
    Handlebars = require('handlebars'),
    request = require('request'),
    xml2js = require('xml2js'),
    moment = require('moment'),
    iconv = require('iconv-lite');

const newsEncoding = 'win1251';

_.mixin(require('underscore.deferred'));
_.mixin(require('underscore.string'));

Handlebars.registerHelper('currDate', function () {
    moment.lang('ru');
    return moment().format('dddd, Do MMMM YYYY');
});

Handlebars.registerHelper('fmtDate', function (dateToFormat) {
    moment.lang('ru');
    return moment(dateToFormat).format('LLL');
});

var rejectDeferred = function rejectDeferred(err) {
    console.log(err);
    this.reject(err);
};

var retrieveNews = function retrieveNews(url) {
    var deferred = new _.Deferred();
    request({
        url: url,
        encoding: null
    }, function (error, response, body) {

        if (!error && response.statusCode == 200) {

            var content = iconv.decode(body, newsEncoding),
                parser = new xml2js.Parser();

            parser.parseString(content, function (err, result) {
                if (!err) {
                    var items = _.map(result.rss.channel[0].item, function (item) {
                        return {
                            title: item.title[0],
                            link: item.link[0],
                            description: item.description[0],
                            pubDate: moment(item.pubDate[0]),
                            id: _.slugify(item.title[0] + item.pubDate[0])
                        }
                    });
                    deferred.resolve({
                        items: items
                    });
                } else {
                    deferred.reject(err);
                }
            });
        } else {
            deferred.reject(error);
        }
    });
    return deferred.promise();
};

var readTemplate = function readTemplate(templateFile) {
    var deferred = new _.Deferred(),
        filePath = path.join('./templates', templateFile);
    fs.readFile(filePath, {
        encoding: 'utf-8'
    }, function (err, data) {
        if (!err) {
            deferred.resolve(data);
        } else {
            deferred.reject(err);
        }
    });
    return deferred.promise();
};

var saveNewsToFile = function saveNewsToFile(newsInfo, newsFile) {
    var deferred = new _.Deferred();
    _.when(readTemplate('newsTemplate.hbs')).done(function (plainHtml) {
        var template = Handlebars.compile(plainHtml),
            fileContent = template(newsInfo);
        fs.writeFile(path.normalize(newsFile), fileContent, function (err) {
            if (!err) {
                deferred.resolve(_.extend(newsInfo, {filePath: newsFile}));
            } else {
                deferred.reject(err);
            }
        });
    }).fail(function (err) {
        deferred.reject(err);
    });

    return deferred.promise();
};

var readAndSaveNews = function readAndSaveNews(config) {
    var deferred = new _.Deferred(),
        reject = rejectDeferred.bind(deferred);

    var newsSaveFile = config.configuration['news-save-file'],
        newsRssDetails = config['news-rss'];
    dirsmaker(path.dirname(newsSaveFile));
    _.when(retrieveNews(newsRssDetails.url)).done(function (newsInfo) {
        _.when(saveNewsToFile(newsInfo, newsSaveFile)).done(function (newsInfo) {
            deferred.resolve(newsInfo);
        }).fail(reject);
    }).fail(reject);

    return deferred.promise();
};

module.exports = {readAndSaveNews: readAndSaveNews};