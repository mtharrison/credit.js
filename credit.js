#! /usr/local/bin/node

var request = require('request').defaults({followAllRedirects: true}),
/**
 * Load the jquery module
 */
$ = require('jquery'),
/**
 * Set the base url
 */
_ = require("underscore"),
/**
 * 
 */
prompt = require("prompt"),
config = require("./config.json");

try {
    var account = require("./account.json");
} catch (err) {
    if (err.code === 'MODULE_NOT_FOUND') {
        var account = false;
    }
}

var Credit = function() {
    this.account = {};
    this.data = {}; 
};

Credit.prototype = {
    setAccount: function(account) {
        this.account = account;
        return this;
    },
    /**
     * 
     * @param {type} $html
     * @returns {undefined}
     */
    setMeta: function($html) {
        this.__VIEWSTATE = $html.find(config.viewStateInput).val();
        this.__CURRENTREFRESHTICKET = $html.find(config.currentRefreshTicketInput).val();
    },
    /**
     * 
     * @returns {undefined}
     */
    login: function() {
        var self = this;
        request.get(config.url, function(error, response, body) {
            var $html = $(body);
            self.setMeta($html);
            request.post(config.url, {
                form: {
                    "__CURRENTREFRESHTICKET": self.__CURRENTREFRESHTICKET,
                    "__VIEWSTATE": self.__VIEWSTATE,
                    "loginUser:txtUsername:ECDTextBox": self.account.email,
                    "loginUser:txtPassword:ECDTextBox": self.account.password,
                    "loginUser:ibtnEnter.x": config.imageButtonClickConstants.x,
                    "loginUser:ibtnEnter.y": config.imageButtonClickConstants.y
                }
            }, $.proxy(self.memorableWord, self));
        });
        return this;
    },
    /**
     * 
     * @param {type} error
     * @param {type} response
     * @param {type} body
     * @returns {undefined}
     */
    memorableWord: function(error, response, body) {
        var self = this;
        var $html = $(body);
        self.setMeta($html);
        var letter1 = $html.find(config.memorableWordLetter1Input).html();
        letter1 = letter1.substring(7, letter1.lastIndexOf(":"));
        var letter2 = $html.find(config.memorableWordLetter2Input).html();
        letter2 = letter2.substring(7, letter2.lastIndexOf(":"));
        request.post(response.request.href, {
            form: {
                "__CURRENTREFRESHTICKET": self.__CURRENTREFRESHTICKET,
                "__VIEWSTATE": self.__VIEWSTATE,
                "loginUserMemorableWord:SecurityQuestionUK1_SecurityAnswer1_ECDTextBox": self.account.secret[letter1 - 1],
                "loginUserMemorableWord:SecurityQuestionUK1_SecurityAnswer2_ECDTextBox": self.account.secret[letter2 - 1],
                "loginUserMemorableWord:ibtnEnter.x": config.imageButtonClickConstants.x,
                "loginUserMemorableWord:ibtnEnter.y": config.imageButtonClickConstants.y
            }
        }, $.proxy(self.scrape, self));
    },
    /**
     * 
     * @param {type} error
     * @param {type} response
     * @param {type} body
     * @returns {undefined}
     */
    scrape: function(error, response, body) {
        var $html = $(body);
        var self = this;
        self.data = {
            score: {
                number: $html.find(config.scoreID).html(),
                description: $html.find(config.scoreDescriptionID).html()
            }
        };
        console.log(self.data);
    }
};

(function() {if (account) {
    var credit = new Credit().setAccount(account).login();
} else {
    console.log("Couldn't find an account.json file.");
    console.log("You will need to enter some details");
    prompt.get(['Your email address', 'Your password', 'Your secret answer'], function(err, result) {
        console.log("Loading…");
        new Credit().setAccount({
            "email": result['Your email address'],
            "password": result['Your password'],
            "secret": result['Your secret answer']
        }).login();
    });
}})();

