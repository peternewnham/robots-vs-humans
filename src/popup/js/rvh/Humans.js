RvH.Humans = {

	populate: function(data) {

		if (data !== false) {
			$('#humans').html('<pre>' + RvH.common.Util.htmlEntities(data) + '</pre>');
		}
		else {
			$('#humans').html('<div class="alert alert-danger">' + chrome.i18n.getMessage("fileNotFound", ["humans.txt"]) + '</div>');
		}

	}

};