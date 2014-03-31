var chai = require('chai'),
    assert = chai.assert,
    should = chai.should(),
    expect = chai.expect,
    _ = require('lodash'),
    newsSaver = require('../application/modules/newsSaver'),
    configReader = require('../application/modules/configReader'),
    throwFail = function () {
        throw 'Deferred Failed';
    };

_.mixin(require('underscore.deferred'));


describe('News Saver Functionality', function () {

    describe('Receive news', function () {
        it('should exist', function (done) {
            expect(newsSaver).exist;
            done();
        });

        it('should read news', function (done) {
            _.when(configReader.getConfig()).done(function (config) {
                var newsDetails = newsSaver.readAndSaveNews(config);
                _.when(newsDetails).done(function (newsInfo) {
                    expect(newsInfo).exist;
                    done();
                }).fail(throwFail);
            });
        });

        it('should have some news items', function (done) {
            _.when(configReader.getConfig()).done(function (config) {
                var newsDetails = newsSaver.readAndSaveNews(config);
                _.when(newsDetails).done(function (newsInfo) {
                    expect(newsInfo.items).exist;
                    done();
                }).fail(throwFail);
            });
        });

        it('news should have title and link and publication date', function (done) {
            _.when(configReader.getConfig()).done(function (config) {
                var newsDetails = newsSaver.readAndSaveNews(config);
                _.when(newsDetails).done(function (newsInfo) {
                    _.each(newsInfo.items, function (item) {
                        expect(item.link).exist;
                        expect(item.title).exist;
                        expect(item.description).exist;
                        expect(item.pubDate).exist;
                    });

                    done();
                }).fail(throwFail);
            });
        });

        it('news should have news file path', function (done) {
            _.when(configReader.getConfig()).done(function (config) {
                var newsDetails = newsSaver.readAndSaveNews(config);
                _.when(newsDetails).done(function (newsInfo) {
                    expect(newsInfo.filePath).exist;
                    done();
                }).fail(throwFail);
            });
        });

    });
});