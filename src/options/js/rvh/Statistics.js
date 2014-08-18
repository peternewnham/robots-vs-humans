/**
 * Statistics element/setting handler
 */

RvH.form.Statistics = {

	/**
	 * Set element value and event listener
	 */
	init: function() {

		// get element
		var $field = $('#statistics');

		// get setting value and set element value
		RvH.common.Settings.getSync('statistics', function(value) {
			$field.prop('checked', value);
		});

		// set change event
		$field.on('change', this.saveValue);

	},

	/**
	 * Save element value
	 */
	saveValue: function() {

		// get value
		var value = $('#statistics').prop('checked');

		// send event before they are disabled
		if (value === false) {
			RvH.common.Analytics.event('Settings', 'Statistics', 'Off');
		}

		// save it
		RvH.common.Settings.setSync('statistics', value, function() {
			// send event if enabling
			if (value === true) {
				RvH.common.Analytics.event('Settings', 'Statistics', 'On');
			}
		});

	}

};

// initialise
$(function() {
	RvH.form.Statistics.init();
});