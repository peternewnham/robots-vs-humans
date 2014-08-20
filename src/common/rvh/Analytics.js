/**
 * Analytics class
 */

(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
	(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

// create tracker
ga('create', 'UA-44581945-6', 'auto');

// override function that checks for valid protocol - https://code.google.com/p/analytics-issues/issues/detail?id=312
ga('set', 'checkProtocolTask', function(){});

RvH.common.Analytics = {

	/**
	 * Checks that analytics is enabled by the 'statistics' setting
	 * If enabled, the callback function is called which will contain the tracking code
	 *
	 * @param {Function} callback
	 */
	checkEnabled: function(callback) {

		if (RvH.common.Util.isDevMode()) {

			console.warn('Analytics disabled in dev mode');

		}
		else {

			RvH.common.Settings.getSync('statistics', function(enabled) {

				if (!enabled) {
					console.warn('statistics disabled');
				}
				else {
					callback();
				}

			});

		}

	},

	/**
	 * Tracks a pageview
	 *
	 * @param {String} page
	 */
	pageview: function(page, title) {

		console.log('Analytics.pageview: ', arguments);

		// if analytics is enabled track the pageview
		this.checkEnabled(function() {

			var opts = {
				'page': page,
				'title': title
			};

			ga('send', 'pageview', opts);

			console.log('Analytics.pageview sent: ', opts);

		});

	},

	/**
	 * Tracks an event
	 *
	 * @param {String} category
	 * @param {String} action
	 * @param {String} label
	 * @param {Number} value
	 */
	event: function(category, action, label, value) {

		console.log('Analytics.event: ', arguments);

		// if analytics is enabled track the event
		this.checkEnabled(function() {

			var opts = {
				'hitType': 'event',
				'eventCategory': category,
				'eventAction': action
			};

			// optional args
			if (!!label) {
				opts.eventLabel = label;
				if (!!value) {
					opts.eventValue = value;
				}
			}

			ga('send', opts);

			console.log('Analytics event sent: ', opts);

		});

	}

};