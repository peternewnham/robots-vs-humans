RvH.Humans = {
	populate: function (data) {
		RvH.common.Util.parseText(data, 'humans.txt', function (text) {
			$('#humans').html(text);
		});
	}
};