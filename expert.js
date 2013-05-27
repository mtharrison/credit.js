var request = require('request').defaults({
	headers: {
		'User-Agent': 'Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0)' //Spoof IE9
	},
	followAllRedirects: true
});

$ = require('jquery'),
	url = "https://www.creditexpert.co.uk/MCCLogin.aspx",
	account = require("./account.json"),
	imageButtonClickConstants = {
	x: -302,
	y: -358
};

request.get(url, function(error, response, body) {
	var $html = $(body);
	var __VIEWSTATE = $html.find("input[name='__VIEWSTATE']").val();
	var __CURRENTREFRESHTICKET = $html.find("input[name='__CURRENTREFRESHTICKET']").val();

	request.post(url, {
		form: {
			"__CURRENTREFRESHTICKET": __CURRENTREFRESHTICKET,
			"__VIEWSTATE": __VIEWSTATE,
			"loginUser:txtUsername:ECDTextBox": account.email,
			"loginUser:txtPassword:ECDTextBox": account.password,
			"loginUser:ibtnEnter.x": imageButtonClickConstants.x,
			"loginUser:ibtnEnter.y": imageButtonClickConstants.y,
		}
	}, function(error, response, body) {
		var $html = $(body);
		var letter1 = $html.find("#loginUserMemorableWord_SecurityQuestionLetter1").html();
		letter1 = letter1.substring(7, letter1.lastIndexOf(":"));
		var letter2 = $html.find("#loginUserMemorableWord_SecurityQuestionLetter2").html();
		letter2 = letter2.substring(7, letter2.lastIndexOf(":"));
		var __VIEWSTATE = $html.find("input[name='__VIEWSTATE']").val();
		var __CURRENTREFRESHTICKET = $html.find("input[name='__CURRENTREFRESHTICKET']").val();
		request.post(response.request.href, {
			form: {
				"__CURRENTREFRESHTICKET": __CURRENTREFRESHTICKET,
				"__VIEWSTATE": __VIEWSTATE,
				"loginUserMemorableWord:SecurityQuestionUK1_SecurityAnswer1_ECDTextBox": account.secret[letter1 - 1],
				"loginUserMemorableWord:SecurityQuestionUK1_SecurityAnswer2_ECDTextBox": account.secret[letter2 - 1],
				"loginUserMemorableWord:ibtnEnter.x": imageButtonClickConstants.x,
				"loginUserMemorableWord:ibtnEnter.y": imageButtonClickConstants.y,
			}
		}, function(error, response, body) {
			var $html = $(body);
			var score = $html.find("#MCC_ScorefactorSI1_lblnonLBScoreDeviation").html();
			var scoreDescription = $html.find("#MCC_ScoreIntelligence_ScoreIntelligence_Dial1_MyScoreV31_pnlMyScore1_lblMyScoreDescription").html();
			console.log(score);
			console.log(scoreDescription);
		});
	});
});