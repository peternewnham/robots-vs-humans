/**
 * Debug object
 * Allows for debugging to be switched on and off easily
 */
var debug = {

	enable:	true, 

	log: function() {
		if (this.enable) {
			var args = Array.prototype.slice.call(arguments);
			console.log.apply(console, args);
		}
	}

};

/*chrome.windows.onFocusChanged.addListener(function(windowId) {
	debug.log('window focus changed:', windowId);
});*/

/**
 * Cache for robots and humans txt files so we only have to request them for the first time a host is visited
 */
var cache = {

	/**
	 * The cache object
	 */
	hosts: {},

	getActive: function(callback) {

		var me = this;

		chrome.windows.getLastFocused({ populate: true }, function(window) {

			debug.log('cache.getActive window:', window.id, window);
			
			var tabs = window.tabs;

			for (var i=0,ilen=tabs.length; i<ilen; i++) {

				var tab = tabs[i];

				if (tab.active) {

					chrome.tabs.get(tab.id, function(tab) {

						var host = fetcher.getHost(tab.url);
						debug.log("cache.getActive tab:", tab.id, host);

						var robots, humans;

						try {
							robots = me.get(host, 'robots');
						}
						catch (e) {
							robots = false;
						}

						try {
							humans = me.get(host, 'humans');
						}
						catch (e) {
							humans = false;
						}

						var data = {
							robots:	robots,
							humans:	humans
						};
						
						callback(data);

					});

					break;

				}

			}

		});

	},

	/**
	 * Formats the host name for caching
	 * @param {String} host		The host name to format
	 * @return {String}
	 */
	formatHost: function(host) {

		// strip out http/s
		return host.replace(/^https?:\/\//, '');


	},

	/**
	 * Fetches a cached file for a host
	 * @param {String} host		The host name
	 * @param {String} type		The type of file to fetch - robots or humans
	 */
	get: function(host, type) {

		// format host
		host = this.formatHost(host);

		debug.log('cache.get:', host, type);

		// cache exists
		if (this.hosts.hasOwnProperty(host) && this.hosts[host].hasOwnProperty(type)) {

			debug.log('cache.get:', 'cache found!');

			return this.hosts[host][type];

		}
		// cache does not exist
		else {

			debug.log('cache.get:', 'no cache found :(');

			throw {
				name: 		"CacheError",
				message:	"Cache not found at [" + host + '][' + type + ']'
			};

		}

	},

	/**
	 * Sets a cached file for a host
	 * @param {String} host		The host to fetch
	 * @param {String} type		The type of file to fetch - robots or humans
	 * @param {String} content	The content to set in the cache
	 */
	set: function(host, type, content) {

		// format host
		host = this.formatHost(host);

		debug.log('cache.set:', host, type);

		// create host object if doesn't already exist
		if (!this.hosts[host]) {
			this.hosts[host] = {};
		}

		this.hosts[host][type] = content;

	},

	/**
	 * Deletes a cache file for a host
	 * @param {String} host		The host to delete
	 */
	remove: function(host) {

		// format host
		host = this.formatHost(host);

		debug.log('cache.remove:', host);

		// if host exists in cache
		if (this.hosts.hasOwnProperty(host)) {

			debug.log('cache.remove: host removed');

			// delete it
			delete this.hosts[host];

		}
		else {

			debug.log('cache.remove: host not found in cache');

		}

	}

};

/**
 * Fetcher object for fetching the robots.txt and humans.txt files
 */
var fetcher = {

	/**
	 * Extracts the host part from a url
	 * Example: http://www.blarg.co.uk/one/two/three.html -> http://www.blarg.co.uk/
	 * @param {String} url	The url to extract the host from
	 */
	getHost: function(url) {

		// match host
		var host = url.match(/^https?:\/\/[^\/]+\//);

		// if match exists it's an array so get first item
		if (!!host) {
			host = host[0];
		}

		return host;

	},

	reload: function(callback) {

		var me = this;

		chrome.windows.getLastFocused({ populate: true }, function(window) {

			debug.log('fetcher.reload window:', window.id, window);
			
			var tabs = window.tabs;
			
			for (var i=0,ilen=tabs.length; i<ilen; i++) {

				var tab = tabs[i];

				if (tab.active) {

					debug.log('fetcher.reload tab:', tab.id, tab.url);

					me.fetchSite(tab.url, function(data) {
						callback(data);
					}, true);

					break;

				}

			}

		});

	},

	/**
	 * Fetches a requested file and executes a callback function passing the contents of that file
	 * to the callback. If the file does not exist (response status is not 200) it will send false to the callback
	 * @param {String} url				The url to fetch
	 * @param {Function} callback		The callback function to execute once the data has been fetched
	 * @param {Function} errorCallback	The error callback function to execute on file not found
	 */
	fetch: function(url, callback, errorCallback) {

		debug.log('fetcher.fetch:', url);

		// create xhr
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() {
			
			// request complete
			if (this.readyState === 4) {
				
				// check content type in case the site redirects the request which gives a valid response 
				// but we don't want such as text/html
				var contentType			= this.getResponseHeader('content-type');
				var validContentType	= !!contentType && /text\/plain/.test(contentType);

				// file found
				if (this.status === 200) {

					// if valid content type
					if (validContentType) {

						callback(this.responseText);

					}
					// not valid content type
					else {

						callback(false);

					}

				}
				// file not found
				else {

					if (/^https/.test(url)) {

						errorCallback({
							name:		"FetchError",
							message:	"File not found at " + url
						});

					}
					else {
						callback(false);
					}

				}

			}

		}
		xhr.open("GET", url, true);
		xhr.send();

	},

	/**
	 * Fetches either robots.txt or humans.txt for the host
	 * @param {String} host			The host to fetch the file from
	 * @param {String} type			The type of file to fetch - robots or humans
	 * @param {Function} callback	The callback function to execute once the file data has been fetched
	 * 								Expects parameters of content, type
	 */
	fetchType: function(host, type, callback) {

		debug.log('fetcher.fetchType:', host, type);

		var me = this;

		// look in cache
		try {
			// fetch from cache
			var content = cache.get(host, type);
			// execute callback if found in cache
			callback(content, type);
		}
		// no cache entry found
		catch (e) {

			debug.log("fetcher.fetchType error:", e);

			switch (e.name) {

				case "CacheError":

					// so we need to fetch it from the server
					var file = host + type + '.txt';
					this.fetch(
						// file to fetch
						file,
						// callback on valid response
						function(content) {
							// set cache
							cache.set(host, type, content);
							// execute callback
							callback(content, type);
						},
						// error handler on invalid response
						function(e) {

							debug.log("fetcher.fetchType error:", e);

							// if fetching over https
							if (/^https/.test(host)) {

								// check http in case it exists here
								// https://www.google.com/humans.txt does not exist but http://www.google.com/humans.txt does
								host = host.replace(/^https/, 'http');
								me.fetchType(host, type, callback);

							}

						}
					);

					break;

				default:

					debug.log('Unknown error: ', e);

					break;

			}

		}
	},

	/**
	 * Fetches the robots.txt and humans.txt from a site
	 * @param {String} url			The url of the page we want to fetch from
	 * @param {Function} callback	The callback function to execute once both robots.txt and humans.txt have been fetched
	 * @param {Boolean} ignoreCache	True to ignore cache and fetch from the server
	 */
	fetchSite: function(url, callback, ignoreCache) {

		// only fetch for http or https urls
		if (/^https?:\/\//.test(url)) {

			// get the host
			var host = this.getHost(url);

			// if we are ignoring cache
			if (!!ignoreCache) {

				// delete it first
				cache.remove(host);

			}

			// initialise data
			// callback will not be called until both robots and humans are not null
			var data = {
				robots: null,
				humans:	null
			};

			// fetch robots.txt
			this.fetchType(host, 'robots', function(content, type) {
				data.robots = content;
				if (data.robots !== null && data.humans !== null) {
					callback(data);
				}
			});

			// fetch humans.txt
			this.fetchType(host, 'humans', function(content, type) {
				data.humans = content;
				if (data.robots !== null && data.humans !== null) {
					callback(data);
				}
			});

		}
		else {

			debug.log('url ignored: ', url);

		}

	}

};

function showIcon(tabId, data) {

	debug.log('Fetched:', data);
	debug.log('Cache:', cache.hosts);

	var icon;
	// get icon
	if (data.robots === false && data.humans === false) {
		icon = 'none';
	}
	else if (data.robots !== false && data.humans !== false) {
		icon = 'both';
	}
	else if (data.robots !== false && data.humans === false) {
		icon = 'robots';
	}
	else {
		icon = 'humans';
	}

	debug.log('Setting pageAction icon:', icon, tabId);

	// show page action
	chrome.pageAction.setIcon({
		tabId:	tabId,
		path:	{
			'19':	'images/icon19_' + icon + '.png',
			'38':	'images/icon38_' + icon + '.png'
		}
	});
	chrome.pageAction.show(tabId);

}

/**
 * We want to fetch the robots.txt and humans.txt file every time a tab visits a new url
 * @see https://developer.chrome.com/extensions/tabs.html#event-onUpdated
 */
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	
	// only fetch when the status is complete
	if (changeInfo.status == 'complete') {

		// get tab url
		var url = tab.url;

		debug.log("Page loaded:", tabId, url);

		// fetch the robots.txt and humans.txt files from the site
		// and show the icon
		fetcher.fetchSite(url, function(data) {
			showIcon(tabId, data);
		});

	}

});

chrome.tabs.onActivated.addListener(function(activeInfo) {

	chrome.tabs.get(activeInfo.tabId, function(tab) {

		// get tab id and url
		var tabId	= tab.id;
		var url		= tab.url;

		debug.log("Tab activated:", tabId, url);

		fetcher.fetchSite(url, function(data) {
			showIcon(tabId, data);
		});

	});

});