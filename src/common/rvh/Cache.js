/**
 * Cache actions
 */

RvH.common.Cache = {

	maximumHostQueueSize: 50,

	getActive: function(callback) {

		var _this = this;

		chrome.windows.getLastFocused({ populate: true }, function(window) {

			console.log('cache.getActive window:', window.id, window);

			var tabs = window.tabs;

			for (var i=0,ilen=tabs.length; i<ilen; i++) {

				var tab = tabs[i];

				if (tab.active) {

					chrome.tabs.get(tab.id, function(tab) {

						var host = RvH.common.Fetcher.getHost(tab.url);
						console.log("cache.getActive tab:", tab.id, host);

						var robots, humans;

						_this.get(host, 'robots', function(robots) {

							_this.get(host, 'humans', function(humans) {

								callback({
									robots: robots,
									humans: humans
								});

							});

						});

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

		return host;

		// strip out http/s
		return host.replace(/^https?:\/\//, '');


	},

	/**
	 * Fetches a cached file for a host
	 * @param {String} host		The host name
	 * @param {String} type		The type of file to fetch - robots or humans
	 * @param {String} callback	Callback to apply
	 */
	get: function(host, type, callback) {

		// format host
		host = this.formatHost(host);

		RvH.common.Settings.getLocal('hosts', function(hosts) {

			// cache exists
			if (hosts.hasOwnProperty(host) && hosts[host].hasOwnProperty(type)) {

				console.log('cache.get:', host, type, '- cache found!');

				// move the host to the top of the queue
				RvH.common.Cache.setQueue(host, function() {

					callback(hosts[host][type]);

				});

			}
			// cache does not exist
			else {

				console.log('cache.get:', host, type, '- no cache found :(');

				callback(false);

			}

		});

	},

	/**
	 * Sets a cached file for a host
	 * @param {String} host			The host to fetch
	 * @param {String} type			The type of file to fetch - robots or humans
	 * @param {String} content		The content to set in the cache
	 * @param {Function} callback	Callback function once it's all been done
	 */
	set: function(host, type, content, callback) {

		var _this = this;

		// format host
		host = this.formatHost(host);

		console.log('cache.set:', host, type);

		// get cached hosts
		RvH.common.Settings.getLocal(['hostQueue', 'hosts'], function(values) {

			var hostQueue	= values.hostQueue;
			var hosts		= values.hosts;

			var hostQueueIndex = hostQueue.indexOf(host);

			// add host to the top of the queue
			if (hostQueueIndex >= 0) {
				hostQueue.splice(hostQueueIndex, 1);
			}
			hostQueue.push(host);

			// if host queue is too big then remove the bottom item
			if (hostQueue.length > _this.maximumHostQueueSize) {
				var hostToRemove = hostQueue.shift();
				delete hosts[hostToRemove];
			}

			// create host entry if not already done
			if (!hosts[host]) {
				hosts[host] = {};
			}

			// populate it
			hosts[host][type] = content;

			// save hosts and queue
			RvH.common.Settings.setLocal(['hostQueue', 'hosts'], [hostQueue, hosts], function() {
				if (typeof callback === 'function') {
					callback();
				}
			});

		});

	},

	/**
	 * Sets the host queue moving the host to the top of the queue and removing any hosts if the queue has become too big
	 * @param {String} host			The host to add
	 * @param {Function} callback	Callback function
	 */
	setQueue: function(host, callback) {

		var _this = this;

		// get cached hosts
		RvH.common.Settings.getLocal(['hostQueue', 'hosts'], function(values) {

			var hostQueue	= values.hostQueue;
			var hosts		= values.hosts;

			var hostQueueIndex = hostQueue.indexOf(host);

			// add host to the top of the queue
			if (hostQueueIndex >= 0) {
				hostQueue.splice(hostQueueIndex, 1);
			}
			hostQueue.push(host);

			// if host queue is too big then remove the bottom item
			if (hostQueue.length > _this.maximumHostQueueSize) {
				var hostToRemove = hostQueue.shift();
				delete hosts[hostToRemove];
			}

			// save hosts and queue
			RvH.common.Settings.setLocal(['hostQueue', 'hosts'], [hostQueue, hosts], function() {
				if (typeof callback === 'function') {
					callback();
				}
			});

		});

	},

	/**
	 * Deletes a cache file for a host
	 * @param {String} host		The host to delete
	 */
	remove: function(host, callback) {

		// format host
		host = this.formatHost(host);

		console.log('cache.remove:', host);

		// get cached hosts
		RvH.common.Settings.getLocal(['hostQueue', 'hosts'], function(values) {

			var hostQueue	= values.hostQueue;
			var hosts		= values.hosts;

			var queueIndex = hostQueue.indexOf(host);
			if (queueIndex >= 0) {
				hostQueue.splice(queueIndex, 1);
			}

			delete hosts[host];

			RvH.common.Settings.setLocal(['hostQueue', 'hosts'], [hostQueue, hosts], function() {

				if (typeof callback === 'function') {
					callback();
				}

			});

		});

	}

};