#! /usr/local/bin/node
(function() {
    var CreditExpert = require("./CreditExpert"),
            prompt = require("prompt"),
            config = require("./config.json");

    //Try to parse an account.json file
    try {
        var account = require("./account.json");
    } catch (err) {
        if (err.code === 'MODULE_NOT_FOUND') {
            var account = false;
        }
    }

    //If account details are set, use them. Otherwise prompt for credentials
    if (account) {
        console.log("Loading…");
        var credit = new CreditExpert.create(config, account).login();
    } else {
        console.log("Couldn't find an account.json file.");
        console.log("You will need to enter some details");
        prompt.get(['Your email address', 'Your password', 'Your secret answer'], function(err, result) {
            console.log("Loading…");
            new CreditExpert.create(config, {
                "email": result['Your email address'],
                "password": result['Your password'],
                "secret": result['Your secret answer']
            }).login();
        });
    }
})();

