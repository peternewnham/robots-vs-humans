RvH = {
	form: {}
};

$(function() {

	// track page view
	RvH.common.Analytics.pageview('options.html', 'Options');

	// translations
	$('[data-i18n]').each(function() {
		$(this).text(chrome.i18n.getMessage($(this).data('i18n')));
	});

});