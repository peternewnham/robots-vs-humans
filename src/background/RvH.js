// strict mode
"use strict";

var RvH = {

	showIcon: function(tabId, data) {

		console.log('Show Icon:', data);

		var icon;
		// get icon
		if (data.robots === false && data.humans === false) {
			icon = '_none';
		}
		else if (data.robots !== false && data.humans !== false) {
			icon = '';
		}
		else if (data.robots !== false && data.humans === false) {
			icon = '_robots';
		}
		else {
			icon = '_humans';
		}

		console.log('Setting pageAction icon:', icon, tabId);

		// show page action
		chrome.pageAction.setIcon({
			tabId:	tabId,
			path:	{
				'19':	'icons/icon19' + icon + '.png',
				'38':	'icons/icon38' + icon + '.png'
			}
		});
		chrome.pageAction.show(tabId);

	}

};

/**
 * Initial set up - grab all extensions and add them to the data store
 */
chrome.runtime.onInstalled.addListener(function(details) {

	console.info('onInstalled event detected:', details);

	/*
	 * First install
	 */
	if (details.reason === 'install') {

		// load default settings
		RvH.common.Settings.init();

		// track install event
		RvH.common.Analytics.event('Run', 'Install');

		// set update type
		RvH.common.Settings.setLocal('updateType', 'install');

	}
	/*
	 * Update
	 */
	else if (details.reason === 'update') {

		// track update event
		RvH.common.Analytics.event('Run', 'Update');

		// set update type
		RvH.common.Settings.setLocal('updateType', 'update');

	}

	// track page view
	RvH.common.Analytics.pageview('background.html', 'Background');

});

/**
 * Start up
 */
chrome.runtime.onStartup.addListener(function() {

	console.info('onStartup event detected');

	// track page view
	RvH.common.Analytics.pageview('background.html', 'Background');

	// track run event
	RvH.common.Analytics.event('Run', 'Open');

});

/**
 * We want to fetch the robots.txt and humans.txt file every time a tab visits a new url
 * @see https://developer.chrome.com/extensions/tabs.html#event-onUpdated
 */
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	
	// only fetch when the status is complete
	if (changeInfo.status == 'complete') {

		// get tab url
		var url = tab.url;

		console.log("Page loaded:", tabId, url);

		// fetch the robots.txt and humans.txt files from the site
		// and show the icon
		RvH.common.Fetcher.fetchSite(url, function(data) {
			RvH.showIcon(tabId, data);
		});

	}

});

chrome.tabs.onActivated.addListener(function(activeInfo) {

	chrome.tabs.get(activeInfo.tabId, function(tab) {

		// get tab id and url
		var tabId	= tab.id;
		var url		= tab.url;

		console.log("Tab activated:", tabId, url);

		RvH.common.Fetcher.fetchSite(url, function(data) {
			RvH.showIcon(tabId, data);
		});

	});

});

// set error handling
window.onerror = function(message, url, linenumber) {
	RvH.common.Util.logError(message, url, linenumber);
	return false;
}