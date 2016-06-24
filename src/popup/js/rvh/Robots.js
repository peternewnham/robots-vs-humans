RvH.Robots = {
    populate: function(data) {
        chrome.tabs.query({
            'active': true,
            'windowId': chrome.windows.WINDOW_ID_CURRENT
        }, function(tabs) {
            var tablink = tabs[0].url;
            //Regex to match only the protocol and host of a url
            tablink = tablink.match(/^[\w-]+:\/{2,}\[?([\w\.:-]+)\]?(?::[0-9]*)?/)[0];
            if (data !== false) {
                var htmlEntities = RvH.common.Util.htmlEntities(data);
                var robot = RvH.common.Util.parseAsLink(htmlEntities, tablink);
                $('#robots').html('<pre>' + robot + '</pre>');
            } else {
                $('#robots').html('<div class="alert alert-danger">' + chrome.i18n.getMessage("fileNotFound", ["robots.txt"]) + '</div>');
            }
        });
    }
};
