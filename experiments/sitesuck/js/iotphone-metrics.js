'use strict';
/* jshint ignore:start */

//google analytics
(function (i, s, o, g, r, a, m) {
	i['GoogleAnalyticsObject'] = r; i[r] = i[r] || function () {
		(i[r].q = i[r].q || []).push(arguments)
	}, i[r].l = 1 * new Date(); a = s.createElement(o),
	m = s.getElementsByTagName(o)[0]; a.async = 1; a.src = g; m.parentNode.insertBefore(a, m)
})(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');
// Use a different Google Analytics ID depending on environment (dev/prod)
if (digitalData.isProduction) {
	window.ga('create', 'UA-68346429-2', 'auto');
	console.log('send:/iotphone to prod');
} else {
	window.ga('create', 'UA-68346429-1', 'auto');
	console.log('send:/iotphone to dev');
}
ga('send', 'pageview', '/iotphone');

//coremetrics
//check the client\config.js file for definition
window.digitalData.page.pageInfo.pageID = '/iotphone'; // this is mandatory for all pages
window.digitalData.page.pageInfo.onsiteSearchTerm = "discover-iot";// mandatory, search keyword should be a String
window.digitalData.page.pageInfo.onsiteSearchResult = "1"; // mandatory, search result should be a number
console.log("coremtrics digitalData used in webmetrics service:" + JSON.stringify(digitalData));
/* jshint ignore:end*/
