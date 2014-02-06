var noop = function noop() {
};

var require = require || noop;

var log = function log() {
    return require('./modules/logging');
};

var getConfig = function getConfig() {
    try {
        var configReader = require('./modules/configReader');
        return configReader.getConfig();
    } catch (e) {
        return {};
    }
};

var executeShell = function executeShell(shellScript) {
    var exec = require('child_process').execFile;
    exec(shellScript, function (error, stdout, stderr) {
        if (error !== null) {
            log().error('Error for: ' + shellScript + ': ' + error);
        }
    });
    log().info('Running: ' + shellScript);
};

var gui;
try {
    gui = require('nw.gui');
} catch (e) {
    gui = {};
}

var getUserName = function getUserName() {
    try {
        return process.env['USERNAME'];
    } catch (e) {
        return 'Zapolski';
    }
};

var closeWindowDialogConfig = {
    dialogClass: 'no-close',
    buttons: [
        {
            text: "Да",
            click: function () {
                $(this).dialog("close");
                getCurrentWindow().close();
            }
        },
        {
            text: "Нет",
            click: function () {
                $(this).dialog("close");
            }
        }
    ]
};

var getCurrentWindow = function getCurrentWindow() {
    try {
        return gui.Window.get();
    } catch (e) {
        return {minimize: noop, close: noop};
    }
};


(function ($, _) {

    var registerEvents = function registerEvents() {
        $('.user').text(getUserName());

        $('.close').click(function (e) {
            $(".close-dialog").dialog(closeWindowDialogConfig);
            e.preventDefault();
        });

        $('.minimize').click(function (e) {
            getCurrentWindow().minimize();
            e.preventDefault();
        });
    };

    var populateLauncherButtons = function populateLauncherButtons(config) {

        var drawLauncherButton = function drawLauncherButton(container) {
            var buttonContainer = $('<div/>'),
                buttonUrl = $('<a/>'),
                buttonImg = $('<img/>');

            buttonContainer.addClass(this.size === 'big' ? 'big-launch-button' : 'small-launch-button');
            if (this.lastInRow) {
                buttonContainer.addClass('last');
            }

            buttonUrl.addClass('launcher');
            buttonUrl.addClass(this.class);
            buttonUrl.attr('title', this.title);

            switch (this.type) {
                case 'url':
                    buttonUrl.attr('href', this.url);
                    break;
                case 'exec':
                    buttonUrl.attr('href', '#');
                    buttonUrl.click(executeShell.bind(null, this.exec));
                    break;
                case 'link':
                    buttonUrl.attr('href', 'url:' + this.link);
                    break;
                default :
                    break;
            }

            buttonContainer.append(buttonUrl);

            buttonImg.attr('src', this.image);
            buttonImg.attr('title', this.title);
            buttonUrl.append(buttonImg);

            container.append(buttonContainer);
        };

        var launcherButtons = config['launch-buttons'],
            buttonsContainer = $('.launch-buttons');
        _.each(launcherButtons, function (launcherButton) {
            drawLauncherButton.call(launcherButton, buttonsContainer);
        });
    };

    var updateTechSupportContact = function updateTechSupportContact(config) {
        var supportLink = $('.support a'),
            techSupportDetails = config['tech-support'],
            supportUrl = (techSupportDetails && techSupportDetails.url) || '#';
        supportLink.attr('href', supportUrl);
    };

    var retrieveNews = function retrieveNews(config) {
        var newsContainer = $('.news-list'),
            newsRssDetails = config['news-rss'],
            rssUrl = (newsRssDetails && newsRssDetails.url) || '#',
            newsAmount = newsRssDetails.count || 3;
        $.get(rssUrl, function (data) {
            newsContainer.html("");
            var newsItems = $(data).find('item');
            newsItems.each(function (index) {
                if (index + 1 > newsAmount) {
                    return false;
                }
                var newsDetails = $(this),
                    newsTitle = newsDetails.find('title').text(),
                    newsLink = newsDetails.find('link').text(),
                    newPubDate = new Date(newsDetails.find('pubDate').text()),
                    newPubTime = newPubDate.getHours() + ':' + newPubDate.getMinutes(),
                    newsListItem = $('<li/>'),
                    newsTimeItem = $('<span class="time"/>'),
                    newsDetailsItem = $('<span class="text"/>'),
                    newsLinkItem = $('<a/>');

                newsTimeItem.text(newPubTime);
                newsListItem.append(newsTimeItem);

                newsLinkItem.attr('href','url:' + newsLink);
                newsLinkItem.text(newsTitle);
                newsDetailsItem.append(newsLinkItem);
                newsListItem.append(newsDetailsItem);

                newsContainer.append(newsListItem);
                return true;
            });
        });
    };

    $(function () {
        registerEvents();
        $.when(getConfig()).then(function (config) {
            populateLauncherButtons(config);
            updateTechSupportContact(config);
            retrieveNews(config);
        });
    });
})(jQuery, _);