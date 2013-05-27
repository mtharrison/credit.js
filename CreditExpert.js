var request = require('request').defaults({followAllRedirects: true}),
$ = require('jquery'),
        _ = require("underscore");
var CreditExpert = function(config, account) {
    this.config = config;
    this.account = account;
    this.data = {};
};

function trimWhiteSpace (str) {
    return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
}

CreditExpert.prototype = {
    /**
     * 
     * @param {type} $html
     * @returns {undefined}
     */
    setMeta: function($html) {
        var self = this;
        this.__VIEWSTATE = $html.find(self.config.viewStateInput).val();
        this.__CURRENTREFRESHTICKET = $html.find(self.config.currentRefreshTicketInput).val();
    },
    /**
     * 
     * @returns {undefined}
     */
    login: function() {
        var self = this;
        request.get(self.config.startUrl, function(error, response, body) {
            var $html = $(body);
            self.setMeta($html);
            form = {
                "__CURRENTREFRESHTICKET": self.__CURRENTREFRESHTICKET,
                "__VIEWSTATE": self.__VIEWSTATE,
                "loginUser:txtUsername:ECDTextBox": self.account.email,
                "loginUser:txtPassword:ECDTextBox": self.account.password,
                "loginUser:ibtnEnter.x": self.config.imageButtonClickConstants.x,
                "loginUser:ibtnEnter.y": self.config.imageButtonClickConstants.y
            };
            request.post(self.config.startUrl, {form: form}, $.proxy(self.memorableWord, self));
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
        var self = this,
                $html = $(body),
                letter1 = $html.find(self.config.memorableWordLetter1Input).html(),
                letter2 = $html.find(self.config.memorableWordLetter2Input).html(),
                indexes = [letter1, letter2].map(function(value) {
            return parseInt(value.substring(7, value.lastIndexOf(":"))) - 1;
        });
        self.setMeta($html);
        form = {
            "__CURRENTREFRESHTICKET": self.__CURRENTREFRESHTICKET,
            "__VIEWSTATE": self.__VIEWSTATE,
            "loginUserMemorableWord:SecurityQuestionUK1_SecurityAnswer1_ECDTextBox": self.account.secret[indexes[0]],
            "loginUserMemorableWord:SecurityQuestionUK1_SecurityAnswer2_ECDTextBox": self.account.secret[indexes[1]],
            "loginUserMemorableWord:ibtnEnter.x": self.config.imageButtonClickConstants.x,
            "loginUserMemorableWord:ibtnEnter.y": self.config.imageButtonClickConstants.y
        };
        request.post(response.request.href, {form: form}, $.proxy(self.fullReport, self));
    },
    fullReport: function(error, response, body) {
        var self = this;
        request(self.config.fullReportUrl, $.proxy(self.scrape, self));
    },
    /**
     * 
     * @param {type} error
     * @param {type} response
     * @param {type} body
     * @returns {undefined}
     */
    scrape: function(error, response, body) {
        var self = this,
                $html = $(body);
        self.data = {
            score: {
                number: $html.find(self.config.scoreID).html(),
                description: $html.find(self.config.scoreDescriptionID).html()
            },
            details: {
                name: $html.find(self.config.name).html(),
            },
            summary: {
                numAccounts: $html.find(self.config.summaryNumberofAccounts).html(),
                outstandingDebt: $html.find(self.config.outstandingDebt).html(),
                numOverdueAccounts: $html.find(self.config.numOverdueAccounts).html(),
                numMissedOrLatePayments: $html.find(self.config.numMissedOrLatePayments).html(),
            },
            accounts: []
        };
        $html.find(".accountrowblue").each(function(){
            self.data.accounts.push({
                name: trimWhiteSpace($(this).children("div").eq(0).html()),
                type: trimWhiteSpace($(this).children("div").eq(1).html()),
                status: trimWhiteSpace($(this).children("div").eq(2).html()),
                owed: trimWhiteSpace($(this).children("div").eq(3).html()),
                lastUpdated: trimWhiteSpace($(this).children("div").eq(4).html()),
            });
        });
        console.log(self.data);
    }
};
module.exports.create = CreditExpert;