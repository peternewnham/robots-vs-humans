RvH = {

	initEvents: function() {

		/**
		 * Link click events
		 * Open external links in a new tab
		 */
		$('body').on('click', 'a', function(e) {

			// get url
			var href = $(this).attr('href');

			// link contains :// so is external
			if (/:\/\//.test(href)) {

				e.preventDefault();

				// open it
				RvH.common.Util.openLink(href);

			}

		});

		/**
		 * Bootstrap tab show event
		 * Sometimes scrollbar does not show so this tries to force it to do so
		 */
		$('a[data-toggle="tab"]').on('shown.bs.tab', function(e) {

			// also track tab view
			RvH.common.Analytics.pageview('popup.html' + $(e.target).attr('href'), 'Popup ' + $(e.target).data('title'));

		});

	}

};

$(function() {

	/**
	 * Populate the popup
	 */
	function populate(data) {

		// robots.txt
		var robots = data.robots;
		if (robots !== false) {
			$('#robots').html('<pre>' + RvH.common.Util.htmlEntities(robots) + '</pre>');
		}
		else {
			$('#robots').html('<p>' + chrome.i18n.getMessage("fileNotFound", ["robots.txt"]) + '</p>');	
		}

		// humans.txt
		var humans = data.humans;
		if (humans !== false) {
			$('#humans').html('<pre>' + RvH.common.Util.htmlEntities(humans) + '</pre>');
		}
		else {
			$('#humans').html('<p>' + chrome.i18n.getMessage("fileNotFound", ["humans.txt"]) + '</p>');	
		}

		// fight!
		RvH.Fight.init(data);

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
			RvH.common.Fetcher.reload(populate);
		});

	// get the active page files and populate the popup
	RvH.common.Cache.getActive(function(data) {
		RvH.Robots.populate(data.robots);
		RvH.Humans.populate(data.humans);
		RvH.Fight.init(data);
	});

	// localization
	$('#header').html(chrome.i18n.getMessage('popupHeader'));
	$('a[href=#fight]').text(chrome.i18n.getMessage('fight').toLowerCase());
	$('#reload').text(chrome.i18n.getMessage('reload'));

	// events

	// track page view
	RvH.common.Analytics.pageview('popup.html#robots', 'Popup Robots');

	RvH.initEvents();

});

// set error handling
window.onerror = function(message, url, linenumber) {
	RvH.common.Util.logError(message, url, linenumber);
}