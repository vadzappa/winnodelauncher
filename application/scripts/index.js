var MAXIMUM_NEWS_TITLE_LENGTH = 34;

var IS_DEBUG = true,
    debug = function () {
        console.log('debugging smth...');
        if (!IS_DEBUG) {
            return;
        }

        console.log.apply(console, _.toArray(arguments));
    };

var noop = function noop() {
    },
    require = require || noop,
    gui,
    closeWindowDialogConfig = {
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

try {
    gui = require('nw.gui');
} catch (e) {
    gui = {};
}

var log = function log() {
    return require('./modules/logging');
};

var newsSaver = function newsSaver() {
    return require('./modules/newsSaver');
};

var getConfig = function getConfig() {
    try {
        var configReader = require('./modules/configReader');
        return configReader.getConfig();
    } catch (e) {
        return {};
    }
};

var executeFileShell = function executeFileShell(shellScript, args) {
    var exec = require('child_process').execFile;
    exec(shellScript, args, function (error, stdout, stderr) {
        if (error !== null) {
            log().error('Error for: ' + shellScript + ': ' + error);
        }
    });
    log().info('Running: ' + shellScript);
};

var executeShell = function executeShell(shellScript) {
    var exec = require('child_process').exec;
    exec(shellScript, function (error, stdout, stderr) {
        if (error !== null) {
            log().error('Error for: ' + shellScript + ': ' + error);
        }
    });
    log().info('Running: ' + shellScript);
};

var getUserName = function getUserName() {
    try {
        return process.env['USERNAME'];
    } catch (e) {
        return 'Zapolski';
    }
};

var getCurrentWindow = function getCurrentWindow() {
    try {
        return gui.Window.get();
    } catch (e) {
        return {minimize: noop, close: noop};
    }
};

var encodeMessage = function encodeMessage(password, message) {
        return message;
    };

var TOKENS = {
    '${USER_HASHED}': function (config, button) {
        return encodeMessage(config.password, JSON.stringify(_.pick(process.env, 'USER', 'USERNAME')));
    }
};


var applyTokens = function applyTokens(config, buttons) {
    debug('applying tokens');
    _.each(buttons, function (button) {
        if (button.type === 'url' || button.type === 'link') {
            var propertyWithTokens = button[button.type];
            if (propertyWithTokens) {
                _.each(_.keys(TOKENS), function (key) {
                    propertyWithTokens = propertyWithTokens.replace(key, TOKENS[key](config['encryption-config'], button));
                });

            }
        }
    });
    return buttons;
};

(function ($, _) {

    var registerEvents = function registerEvents() {
        $('.user-name').text(getUserName());

        $('.close').click(function (e) {
            $(".close-dialog").dialog(closeWindowDialogConfig);
            e.preventDefault();
        });

        $('.minimize').click(function (e) {
            getCurrentWindow().minimize();
            e.preventDefault();
        });
    };

    var startizeAllLinks = function startizeAllLinks() {
        $('a[href^=http], a[href^=file]').each(function () {
            var $link = $(this);
            $link.click(executeShell.bind(null, 'start ' + $link.attr('href')));
            $link.attr('href', '#');
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
                    buttonUrl.click(executeFileShell.bind(null, this.exec));
                    break;
                case 'link':
                    buttonUrl.attr('href', '#');
                    buttonUrl.click(executeShell.bind(null, 'start ' + this.link));
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

        var launcherButtons = applyTokens(config, config['launch-buttons']),
            leftButtonsContainer = $('.left-column .launch-buttons'),
            rightButtonsContainer = $('.right-column .launch-buttons'),
            leftColumnButtons = _.filter(launcherButtons, function (launcherButton) {
                return launcherButton.position === 'left';
            }),
            rightColumnButtons = _.filter(launcherButtons, function (launcherButton) {
                return launcherButton.position === 'right';
            });

        debug('drawing buttons');

        _.each(leftColumnButtons, function (launcherButton) {
            drawLauncherButton.call(launcherButton, leftButtonsContainer);
        });
        _.each(rightColumnButtons, function (launcherButton) {
            drawLauncherButton.call(launcherButton, rightButtonsContainer);
        });
    };

    var updateTechSupportContact = function updateTechSupportContact(config) {
        debug('technical contacts loading');
        var supportContainer = $('footer .support');
        $.each(applyTokens(config, config.footerLinks), function (index, footerLink) {
            var supportLink = $('<a></a>');
            supportLink.text(footerLink.text);
            switch (footerLink.type) {
                case 'url':
                    supportLink.attr('href', this.url);
                    break;
                case 'exec':
                    supportLink.attr('href', '#');
                    supportLink.click(executeFileShell.bind(null, this.exec));
                    break;
                case 'link':
                    supportLink.attr('href', '#');
                    supportLink.click(executeShell.bind(null, 'start ' + this.link));
                    break;
                default :
                    break;
            }

            supportContainer.append(supportLink);
        });
    };

    var retrieveNews = function retrieveNews(config) {
        debug('reading news');
        var newsContainer = $('.news-list'),
            newsRssDetails = config['news-rss'],
            newsAmount = newsRssDetails.count || 3;


        $.when(newsSaver().readAndSaveNews(config)).done(function (newsInfo) {
            newsContainer.html("");
            $.each(newsInfo.items, function (index, item) {
                if (index + 1 > newsAmount) {
                    return false;
                }
                var newsTitle = item.title,
                    newsLink = 'file:///' + newsInfo.filePath + '#' + item.id,
                    newPubDate = item.pubDate,
                    newPubTime = newPubDate.format('HH:mm'),
                    newsListItem = $('<li/>'),
                    newsTimeItem = $('<span class="time"/>'),
                    newsDetailsItem = $('<span class="text"/>'),
                    newsLinkItem = $('<a/>');

                if (newsTitle.length > MAXIMUM_NEWS_TITLE_LENGTH) {
                    newsTitle = newsTitle.substr(0, MAXIMUM_NEWS_TITLE_LENGTH) + '...';
                }

                debug(newsLink);

                newsTimeItem.text(newPubTime);
                newsListItem.append(newsTimeItem);

                newsLinkItem.attr('href', '#');
                newsListItem.click(executeFileShell.bind(null, config.configuration.browser, [newsLink]));

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
        startizeAllLinks();
        $.when(getConfig()).then(function (config) {
            debug('config read');
            populateLauncherButtons(config);
            updateTechSupportContact(config);
            retrieveNews(config);
        });
    });
})(jQuery, _);