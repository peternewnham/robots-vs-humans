/**
 * The fight class! Yeah!
 * Converts the robots.txt and humans.txt to a hash and then iterate through each character doing a string compare
 * The winner is whoever has the most greater than comparisons between each character
 */
RvH.Fight = {

	/**
	 * the robots.txt and humans.txt data
	 */
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
	 * Fight details
	 */
	fightDetails: {

		/**
		 * The winner of the fight
		 */
		winner: null,

		/**
		 * Number of robot punches in the fight
		 */
		robotPunches: 0,

		/**
		 * Number of human punches in the fight
		 */
		humanPunches: 0,

		/**
		 * Percentage of health to drop per attack
		 */
		dropPercent: 10,

		/**
		 * Remaining human health
		 */
		humanHealth: 100,

		/**
		 * Remaining robot health
		 */
		robotHealth: 100,

		/**
		 * The order of the punches
		 */
		punchOrder: [],

		/**
		 * Current attack index
		 */
		index: 0,

		/**
		 * Duration of each attack in ms
		 */
		attackDuration: 500

	},

	/**
	 * Initialises the fight
	 */
	init: function(data) {

		// set/reset data
		this.data = data;
		this.robotData	= RvH.common.Util.md5(this.data.robots || "");
		this.humanData	= RvH.common.Util.md5(this.data.humans || "");

		this.fightDetails = {
			winner:			null,
			robotPunches:	0,
			humanPunches:	0,
			dropPercent:	10,
			humanHealth:	100,
			robotHealth:	100,
			punchOrder:		[],
			index:			0,
			attackDuration:	600
		};

		// generate html for the fight tab
		var html = [
			'<div class="row text-center">',
				'<div class="col-xs-5">',
					'<div class="progress">',
						'<div id="robot-health-remaining" class="progress-bar progress-bar-warning" style="width:100%"></div>',
						'<div id="robot-health-lost" class="progress-bar progress-bar-danger" style="width:0%"></div>',
					'</div>',
				'</div>',
				'<div class="col-xs-2">',
					'<button id="fight-btn" class="btn btn-large btn-primary" data-action="fight">' + chrome.i18n.getMessage('fight') + '</button>',
				'</div>',
				'<div class="col-xs-5">',
					'<div class="progress">',
						'<div id="human-health-lost" class="progress-bar progress-bar-danger" style="width:0%"></div>',
						'<div id="human-health-remaining" class="progress-bar progress-bar-warning" style="width:100%"></div>',
					'</div>',
				'</div>',
			'</div>',
			'<div class="row char-row">',
				'<div class="col-xs-3 col-xs-offset-2">',
					'<h3 class="text-center">' + chrome.i18n.getMessage('robots') + '</h3>',
					'<p class="text-center"><img id="robot-char" class="char" src="../../images/robot.png" /></p>',
				'</div>',
				'<div class="col-xs-3 col-xs-offset-2">',
					'<h3 class="text-center">' + chrome.i18n.getMessage('humans') + '</h3>',
					'<p class="text-center"><img id="human-char" class="char" src="../../images/human.png" /></p>',
				'</div>',
			'</div>',
			'<div class="text-center">',
				'<div id="fight-outcome" class="alert alert-success hide">',
					'<h2></h2>',
				'</div>',
			'</div>'
		].join('');

		// populate tab html
		$('#fight').html(html);

		// add action to the fight button
		var _this = this;

		$('#fight-btn').click(function() {

			// begin the fight!
			if ($(this).data('action') === 'fight') {

				// log fight start
				RvH.common.Analytics.event('Fight', 'Start');

				// start the fight
				_this.start();

			}
			// or reset the tab
			else {

				// log fight start
				RvH.common.Analytics.event('Fight', 'Reset');

				// reset tab data
				_this.init(_this.data);

			}

		});


	},

	/**
	 * Starts the fight
	 */
	start: function() {

		// shortcut fight details
		var details = this.fightDetails;

		// if there is robots.txt but no humans.txt
		if (this.data.robots !== false && this.data.humans === false) {

			// override details so robots are the winner
			details.humanHealth = 0;
			details.winner = 'robots';
			this.updateBars();

			this.finish(chrome.i18n.getMessage('robotsWinDefault'));
			return;

		}
		// if there is humans.txt but no robots.txt
		else if (this.data.robots === false && this.data.humans !== false) {

			// override details so humans are the winner
			details.robotHealth = 0;
			details.winner = 'humans';
			this.updateBars();

			this.finish(chrome.i18n.getMessage('humansWinDefault'));
			return;

		}
		// if there is no robots.txt or humans.txt
		else if (this.data.robots === false && this.data.humans === false) {

			// override details so no one is the winner
			details.humanHealth = 0;
			details.robotHealth = 0;
			this.updateBars();

			// no one wins
			this.finish(chrome.i18n.getMessage('noWinner'));
			return;

		}
		// both files exist
		else {

			// let's get it on!
			this.fight();

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
		$('h2', '#fight-outcome').text(text);
		$('#fight-outcome').removeClass('hide');

		var winner = this.fightDetails.winner;

		// log winner
		RvH.common.Analytics.event('Fight', 'Result', winner || 'none');

		// display the characters as dead
		if (winner !== 'humans') {
			$('#human-char').addClass('dead');
		}
		if (winner !== 'robots') {
			$('#robot-char').addClass('dead');
		}

		// update the button to reset the fight
		$('#fight-btn')
			.removeClass('disabled')
			.text(chrome.i18n.getMessage('reset'))
			.data('action', 'reset')
			.removeAttr('disabled');

	},

	/**
	 * Updates the health bars of the robot and human character
	 */
	updateBars: function() {

		// update robot health
		$('#robot-health-remaining').css('width', this.fightDetails.robotHealth + '%');
		$('#robot-health-lost').css('width', (100 - this.fightDetails.robotHealth) + '%');

		// update human health
		$('#human-health-remaining').css('width', this.fightDetails.humanHealth + '%');
		$('#human-health-lost').css('width', (100 - this.fightDetails.humanHealth) + '%');

	},

	/**
	 * Set and and conduct the fight
	 */
	fight: function() {

		// convenience shortcut
		var details = this.fightDetails;

		/*
		 * Work out who is the winner and the order of the punches
		 */
		var robotPunches = 0;
		var humanPunches = 0;
		var punchOrder = [];

		for (var i=0,ilen=this.robotData.length; i<ilen; i=i+2) {

			var robotChar = this.robotData[i];
			var humanChar = this.humanData[i];

			if (robotChar > humanChar) {
				robotPunches++;
				punchOrder.push('robot');
			}
			else if (humanChar > robotChar) {
				humanPunches++;
				punchOrder.push('human');
			}

		}

		details.punchOrder = punchOrder;
		details.robotPunches = robotPunches;
		details.humanPunches = humanPunches;

		if (robotPunches > humanPunches) {
			details.winner = 'robots';
		}
		else if (humanPunches > robotPunches) {
			details.winner = 'humans';
		}

		console.log('punchOrder', punchOrder);
		console.log('robotPunches', robotPunches);
		console.log('humanPunches', humanPunches);

		/*
		 * Calculate the drop percentage of each attack based on the number of punches by the winner
		 */
		if (robotPunches > humanPunches) {
			var dropPercent = (1 / robotPunches) * 100;
		}
		else {
			var dropPercent = (1 / humanPunches) * 100;
		}

		details.dropPercent = dropPercent;

		console.log('dropPercent', dropPercent);

		// attack!
		this.attack();

	},

	/**
	 * Performs an attack by one character on another
	 */
	attack: function() {

		// convenience shortcuts
		var _this = this;
		var details = this.fightDetails;

		// get the current attacker
		var attackerName = details.punchOrder[details.index];

		// attacker is robot
		if (attackerName === 'robot') {

			// reduce human health and remaining robot punches
			details.humanHealth -= details.dropPercent;
			details.robotPunches--;

			// set attacker and attackee details
			var attacker = $('#robot-char');
			var attackee = $('#human-char');
			var attackDir = 1;

		}
		// attacker is human
		else {

			// reduce robot health and remaining human punches
			details.robotHealth -= details.dropPercent;
			details.humanPunches--;

			// set attacker and attackee details
			var attacker = $('#human-char');
			var attackee = $('#robot-char');
			var attackDir = -1;

		}

		// shortcut attack duration
		var duration = details.attackDuration;

		/*
		 * Attack animation
		 * First attacker tilts and moves toward attackee
		 * Then attackee tilts from the hit
		 * Then attacker moves back to origina position
		 */

		// tilt and move attacker
		attacker.css({ transform: 'rotate(' + (15*attackDir) + 'deg)' }).animate({
			left: 250 * attackDir
		}, duration / 2, function() {

			// update health bars
			_this.updateBars();

			// rotate attackee
			$({ deg: 0 }).animate({ deg: 30 }, {
				duration: duration/4,
				step: function(now) {
					if (now > 15) {
						now = 15 - (now-15);
					}
					attackee.css({
						transform: 'rotate(' + now + 'deg)'
					});
				},
				complete: function() {
					attackee.removeAttr('style');
				}
			});

			// move back attacker
			attacker.animate({
				left: 0
			}, duration / 2, function() {

				// untilt attacker
				attacker.removeAttr('style');

				// update fight index
				details.index++;

				// fight is over
				if (
					(details.winner === 'robots' && details.robotPunches === 0) ||
					(details.winner === 'humans' && details.humanPunches === 0) ||
					(details.winner === null && (details.robotPunches === 0 || details.humanPunches === 0))
				) {

					// robot wins
					if (details.robotPunches === 0) {

						details.winner = 'robots';
						_this.finish(chrome.i18n.getMessage('robotsWin'));

					}
					// human wins
					else {

						details.winner = 'humans';
						_this.finish(chrome.i18n.getMessage('humansWin'));

					}

				}
				// fight is not yet over
				else {

					// schedule next attack
					setTimeout(function() {
						_this.attack();
					}, duration / 2);

				}

			});

		});


	}

};