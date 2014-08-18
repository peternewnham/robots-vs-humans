/**
 * Fetcher
 */
RvH.common.Fetcher = {

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

		var _this = this;

		RvH.common.Settings.getLocal('hostQueue', function(queue) {

			var host = queue[queue.length-1];

			_this.fetchSite(host, function(data) {
				callback(data);
			}, true);

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

		console.log('fetcher.fetch:', url);

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

					callback(false);

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

		console.log('fetcher.fetchType:', host, type);

		var _this = this;

		RvH.common.Cache.get(host, type, function(content) {

			// content cached
			if (content !== false) {

				callback(content, type);

			}
			// no cache entry found
			else {

				// so we need to fetch it from the server
				var file = host + type + '.txt';
				_this.fetch(
					// file to fetch
					file,
					// callback on valid response
					function(content) {
						// set cache
						RvH.common.Cache.set(host, type, content);
						// execute callback
						callback(content, type);
					},
					// error handler on invalid response
					function(e) {

						console.log("fetcher.fetchType error:", e);

						// if fetching over https
						if (/^https/.test(host)) {

							// check http in case it exists here
							// https://www.google.com/humans.txt does not exist but http://www.google.com/humans.txt does
							host = host.replace(/^https/, 'http');
							_this.fetchType(host, type, callback);

						}

					}
				);

			}

		});

	},

	/**
	 * Fetches the robots.txt and humans.txt from a site
	 * @param {String} url			The url of the page we want to fetch from
	 * @param {Function} callback	The callback function to execute once both robots.txt and humans.txt have been fetched
	 * @param {Boolean} ignoreCache	True to ignore cache and fetch from the server
	 */
	fetchSite: function(url, callback, ignoreCache) {

		console.log('fetcher.fetchSite:', url);

		var _this = this;

		// only fetch for http or https urls
		if (/^https?:\/\//.test(url)) {

			var fetchData = function() {

				// initialise data
				// callback will not be called until both robots and humans are not null
				var data = {
					robots: null,
					humans:	null
				};

				// fetch robots.txt
				_this.fetchType(host, 'robots', function(content, type) {
					data.robots = content;
					if (data.robots !== null && data.humans !== null) {
						callback(data);
					}
				});

				// fetch humans.txt
				_this.fetchType(host, 'humans', function(content, type) {
					data.humans = content;
					if (data.robots !== null && data.humans !== null) {
						callback(data);
					}
				});

			};

			// get the host
			var host = this.getHost(url);

			// if we are ignoring cache
			if (!!ignoreCache) {

				// delete it first
				RvH.common.Cache.remove(host, function() {

					// then fetch
					fetchData();

				});

			}
			// not ignore host
			else {

				// just fetch it
				fetchData();

			}



		}
		else {

			console.warn('url ignored: ', url);

		}

	}

};