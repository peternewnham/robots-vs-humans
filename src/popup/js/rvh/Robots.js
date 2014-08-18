RvH.Robots = {

	populate: function(data) {

		if (data !== false) {
			$('#robots').html('<pre>' + RvH.common.Util.htmlEntities(data) + '</pre>');
		}
		else {
			$('#robots').html('<div class="alert alert-danger">' + chrome.i18n.getMessage("fileNotFound", ["robots.txt"]) + '</div>');
		}

	}

};