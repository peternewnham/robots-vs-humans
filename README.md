Robots vs Humans - Chrome Extension
===================================
Robots vs Humans is an extension for the Google Chrome browser that will display the robots.txt and humans.txt for any website.

They will also fight each other because that is inevitably what robots and humans will end up doing.

### [Install the extension here from the Chrome Web Store](https://chrome.google.com/webstore/detail/robots-vs-humans/fjnhgpnnokcbcfbopenblmpncpaljfbk)

Please use the [issue tracker](https://github.com/wrakky/robots-vs-humans/issues) to report any bugs or make suggestions

### Quickstart

Install [node.js](http://nodejs.org/). Once installed run the following commands to install grunt, less and generate a build.

```bash
npm install -g grunt-cli less bower
cd /path/to/robots-vs-humans
npm install
bower install
grunt
```

Source code is located in the `src` directory. Grunt will monitor any changes to the files in this folder and automatically compile
and generate a new builds in the `build` directory. Set `/path/to/robots-vs-humans/build` as the location of your unpacked extension and
you can now makes changes and see the results in your browser.

### Translating

If you would like to contribute a translation please either:

1. Fork the repository, add them in `src/_locales` using the guildelines specified in the
[Chrome extension internationalization guide](http://developer.chrome.com/extensions/i18n.html) and submit a pull request.
2. Download the English master version at [src/_locales/en/messages.json](https://github.com/wrakky/robots-vs-humans/blob/master/src/_locales/en/messages.json)
and create a new ticket in the [project issue tracker](https://github.com/wrakky/robots-vs-humans/issues) attaching your translated version.
Please prefix the issue title with '[translation]' and remember to say what language it is for!

All translations should be based on the master English version located at `src/_locales/en/messages.json`

### Credit
If you would like to be credited for your contribution on the about page please also include a name and link (personal site, twitter etc)
with your submission