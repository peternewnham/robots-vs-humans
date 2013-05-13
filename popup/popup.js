/**
 * The fight class! Yeah!
 * Converts the robots.txt and humans.txt to md5 and then iterates through each character doing a string compare
 * The winner is whoever has the most greater than comparisons between each character
 */
var fight = {

	// the robots.txt and humans.txt data
	data:	null,

	/**
	 * MD5 of the robots data
	 */
	robotData:	null,

	/**
	 * MD5 of the humans data
	 */
	humanData:	null,

	/**
	 * The length of the hashed data
	 * Used to calculate bar widths
	 */
	dataLength:	32,

	/**
	 * The robot count in the battle
	 */
	robotCount:	0,

	/**
	 * The human count in the battle
	 */
	humanCount:	0,

	/**
	 * The speed each round in the fight should take in ms
	 */
	fightSpeed:	100,

	/**
	 * Initialises the fight
	 */
	init: function(data) {

		// set/reset data
		this.data = data;
		this.robotData	= md5(this.data.robots || "");
		this.humanData	= md5(this.data.humans || "");
		this.dataLength	= this.robotData.length;
		this.robotCount	= 0;
		this.humanCount	= 0;

		// generate html for the fight tab
		var html = [
			'<div id="bar">',
				'<div class="robots"><div class="text">50%</div></div>',
				'<div class="humans"><div class="text">50%</div></div>',
				'<div class="divider"></div>',
			'</div>',
			'<div class="row">',
				'<div class="span2">',
					'<div class="content">',
						'<h3>' + chrome.i18n.getMessage('robots') + '</h3>',
						'<p><img src="../images/robot.png" /></p>',
					'</div>',
				'</div>',
				'<div class="span4 center">',
					'<div id="fight-outcome" class="alert alert-success hide"></div>',
					'<button id="fight-btn" class="btn btn-large btn-primary">' + chrome.i18n.getMessage('fight') + '</button>',
				'</div>',
				'<div class="span2">',
					'<div class="content pull-right">',
						'<h3>' + chrome.i18n.getMessage('humans') + '</h3>',
						'<p><img src="../images/human.png" /></p>',
					'</div>',
				'</div>',
			'</div>'
		].join('');

		$('#fight').html(html);

		// add action to the fight button
		var me = this;
		$('#fight-btn').click(function() {

			// if text is Fight!
			if ($(this).text() === chrome.i18n.getMessage('fight')) {

				// start the fight
				me.start();

			}
			// otherwise reset the tab
			else {

				me.init(me.data);

			}

		});


	},

	/**
	 * Starts the fight
	 */
	start: function() {

		// if there is robots.txt but no humans.txt
		if (this.data.robots !== false && this.data.humans === false) {

			// robots win by 100%
			this.robotCount = this.dataLength;
			this.updateBars();
			this.finish(chrome.i18n.getMessage('robotsWinDefault'));
			return;

		}
		// if there is humans.txt but no robots.txt
		else if (this.data.robots === false && this.data.humans !== false) {

			// humans win by 100%
			this.humanCount = this.dataLength;
			this.updateBars();
			this.finish(chrome.i18n.getMessage('humansWinDefault'));
			return;

		}
		// if there is no robots.txt or humans.txt
		else if (this.data.robots === false && this.data.humans === false) {

			// no one wins
			this.finish(chrome.i18n.getMessage('noWinner'));
			return;

		}
		// both files exist
		else {	

			// start the first at the first character
			this.charFight(0);

			// disable the button
			$('#fight-btn')
				.addClass('disabled')
				.text(chrome.i18n.getMessage('fighting'))
				.attr('disabled', 'disabled');

		}

	},

	/**
	 * Finishes the fight
	 */
	finish: function(text) {

		// show the fight outcome
		$('#fight-outcome').text(text).show();

		// update the button to reset the fight
		$('#fight-btn')
			.removeClass('disabled')
			.text(chrome.i18n.getMessage('reset'))
			.removeAttr('disabled');

	},

	/**
	 * Fights the characters at each index in the robots and humans hash
	 */
	charFight: function(index) {		

		// get each character
		var robotChar	= this.robotData[index];
		var humanChar	= this.humanData[index];

		console.log(index, robotChar, humanChar, robotChar > humanChar ? 1 : (robotChar < humanChar ? -1 : 0));

		// robot wins
		if (robotChar > humanChar) {
			this.robotCount++;
		}
		// human wins
		else if (robotChar < humanChar) {
			this.humanCount++;
		}

		console.log(this.robotCount, this.humanCount);

		// update the bars to show score
		this.updateBars();

		// increment for next index
		index++;

		// if not at the end
		if (index < this.dataLength) {

			// queue next character fight
			var me = this;
			setTimeout(function() {
				me.charFight(index);
			}, this.fightSpeed);

		}
		// at the end
		else {

			// generate the outcome text
			var outcome = chrome.i18n.getMessage("draw");
			if (this.robotCount > this.humanCount) {
				outcome = chrome.i18n.getMessage("robotsWin");
			}
			else if (this.robotCount < this.humanCount) {
				outcome = chrome.i18n.getMessage("robotsWin");
			}

			// finish the fight
			this.finish(outcome);

		}

	},

	/**
	 * Updates the bars for robots and humans based on the score
	 */
	updateBars: function() {

		// get bars
		var robotBar = $('.robots', '#bar');
		var humanBar = $('.humans', '#bar');

		// calculate the width each point of score is worth
		// they both start at 50% so it is offset by that amount
		var point	= 50 / this.dataLength;

		// calculate robot and human width
		var robotWidth	= parseFloat(50 + ((this.robotCount - this.humanCount) * point));
		var humanWidth	= parseFloat(50 + ((this.humanCount - this.robotCount) * point));

		// update widths
		robotBar.css('width', robotWidth + '%');
		humanBar.css('width', humanWidth + '%');

		// update text
		var robotPercent = String(robotWidth.toFixed(1));
		if (/\.0$/.test(robotPercent)) {
			robotPercent = parseInt(robotPercent, 10);
		}
		var humanPercent = String(humanWidth.toFixed(1));
		if (/\.0$/.test(humanPercent)) {
			humanPercent = parseInt(humanPercent, 10);
		}

		$('.text', robotBar).text(robotPercent + '%');
		$('.text', humanBar).text(humanPercent + '%');

	}

};

$(function() {

	/**
	 * Convert the characters in some text to the html entity equivalent
	 */
	function htmlentities(text) {
		
		return String(text)
				.replace(/&/g, '&amp;')
				.replace(/</g, '&lt;')
				.replace(/>/g, '&gt;')
				.replace(/"/g, '&quot;')
				.replace(/'/g, '&apos;');

	}

	/**
	 * Populate the popup
	 */
	function populate(data) {

		// robots.txt
		var robots = data.robots;
		if (robots !== false) {
			$('#robots').html('<pre>' + htmlentities(robots) + '</pre>');
		}
		else {
			$('#robots').html('<p>' + chrome.i18n.getMessage("fileNotFound", ["robots.txt"]) + '</p>');	
		}

		// humans.txt
		var humans = data.humans;
		if (humans !== false) {
			$('#humans').html('<pre>' + htmlentities(humans) + '</pre>');
		}
		else {
			$('#humans').html('<p>' + chrome.i18n.getMessage("fileNotFound", ["humans.txt"]) + '</p>');	
		}

		// fight!
		fight.init(data);

	};

	// reload the robots.txt and humans.txt files
	$('#reload')
		// show tooltip on button
		.tooltip({
			title:		chrome.i18n.getMessage('reloadTooltip'),
			placement:	'bottom'
		})
		.click(function(e) {
			// update content
			$('#robots').html('<p>' + chrome.i18n.getMessage('reloading') + '</p>');
			$('#humans').html('<p>' + chrome.i18n.getMessage('reloading') + '</p>');
			$('#fight').html('<p>' + chrome.i18n.getMessage('reloading') + '</p>');
			// reload files
			bg.fetcher.reload(populate);
		});

	// get the active page files and populate the popup
	var bg = chrome.extension.getBackgroundPage();
	bg.cache.getActive(populate);

	// localization
	$('#header').html(chrome.i18n.getMessage('popupHeader'));
	$('a[href=#fight]').text(chrome.i18n.getMessage('fight').toLowerCase());
	$('#reload').text(chrome.i18n.getMessage('reload'));

});