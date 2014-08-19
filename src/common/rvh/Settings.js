/**
 * Manage local and synced extension settings
 */

RvH.common.Settings = {

	/**
	 * Default sync settings
	 * These are stored on the google account and will persist across devices
	 */
	defaultSyncSettings: {

		/**
		 * Whether to log statistics to analytics
		 * @var {Boolean}
		 */
		statistics: true

	},

	/**
	 * Default local settings
	 * These are specific to the device and not shared with the account
	 */
	defaultLocalSettings: {

		/**
		 * Hosts queue
		 */
		hostQueue: [],

		/**
		 * Hosts cache so we don't have to continually lookup
		 */
		hosts: {},

		/**
		 * Whether there is a new update
		 * This will be either be false, for no pending update notification, 'update' if the extension has been updated or 'install'
		 * if it has been installed
		 */
		update: false

	},

	/**
	 * Outputs the storage settings to the console for debug purposes
	 */
	show: function() {

		chrome.storage.sync.get(null, function(items) {
			console.log('storage.sync:', items);
		});

		chrome.storage.local.get(null, function(items) {
			console.log('storage.local:', items);
		});

	},

	/**
	 * Sets a storage item
	 * @param {String} type							The type of storage to use - local or sync
	 * @param {String} key							The key to use for the item
	 * @param {Object|String|Number|Boolean} value	The value to save
	 * @param {Function} callback					Callback to call once set
	 */
	set: function(type, key, value, callback) {

		// create object for saving
		var data = {};

		if (key instanceof Array) {
			for (var i=0,ilen=key.length; i<ilen; i++) {
				data[key[i]] = value[i];
			}
		}
		else {
			data[key] = value;
		}

		// save it
		chrome.storage[type].set(data, function() {

			console.log('Setting:', type, key, value);

			// callback
			if (typeof callback === 'function') {
				callback();
			}
		});

	},

	/**
	 * Sets a 'sync' storage item
	 * @param {String} key							The key to use for the item
	 * @param {Object|String|Number|Boolean} value	The value to save
	 * @param {Function} callback					Callback to call once set
	 */
	setSync: function(key, value, callback) {

		this.set('sync', key, value, callback);

	},

	/**
	 * Sets a 'local' storage item
	 * @param {String} key							The key to use for the item
	 * @param {Object|String|Number|Boolean} value	The value to save
	 * @param {Function} callback					Callback to call once set
	 */
	setLocal: function(key, value, callback) {

		this.set('local', key, value, callback);

	},

	/**
	 * Fetches a storage item
	 * @param {String} type			The type of storage to use - local or sync
	 * @param {String} key			The key to fetch, or null to return all items
	 * @param {Function} callback	Callback function which will have the storage item passed to it
	 */
	get: function(type, key, callback) {

		// get default settings
		var defaultSettings = type === 'sync' ? this.defaultSyncSettings : this.defaultLocalSettings;

		// fetch item from storage
		chrome.storage[type].get(key, function(items) {

			// key is null so fetch all items
			if (key === null) {

				// callback
				callback(items);

			}
			// fetch specific item
			else {

				// just want a single value
				if (typeof key === 'string') {

					// if key does not exist in storage then return the default value instead
					var value = items.hasOwnProperty(key) ? items[key] : defaultSettings[key];

				}
				// more than 1 value
				else {

					var value = {};

					// loop through each value and get the storage value or default if it's not already set
					for (var field in items) {
						value[field] = items.hasOwnProperty(field) ? items[field] : defaultSettings[field];
					}

				}

				// callback
				callback(value);

			}

		});

	},

	/**
	 * Fetches a 'sync' storage item
	 * @param {String} key			The key to fetch, or null to return all items
	 * @param {Function} callback	Callback function which will have the storage item passed to it
	 */
	getSync: function(key, callback) {

		this.get('sync', key, callback);

	},

	/**
	 * Fetches a 'local' storage item
	 * @param {String} key			The key to fetch, or null to return all items
	 * @param {Function} callback	Callback function which will have the storage item passed to it
	 */
	getLocal: function(item, callback) {

		this.get('local', item, callback);

	},

	/**
	 * Initialises storage, clearing any previous values and saving the defaults
	 */
	init: function() {

		var _this = this;

		// clear sync and save default sync settings
		chrome.storage.sync.clear(function() {
			chrome.storage.sync.set(_this.defaultSyncSettings);
		});

		// clear local and save default local settings
		chrome.storage.local.clear(function() {
			chrome.storage.local.set(_this.defaultLocalSettings);
		});

	}

};