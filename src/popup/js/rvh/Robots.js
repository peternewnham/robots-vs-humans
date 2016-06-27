RvH.Robots = {
	populate: function (data) {
		RvH.common.Util.parseText(data, 'robots.txt', function (text) {
			$('#robots').html(text);
		});
	}
};
