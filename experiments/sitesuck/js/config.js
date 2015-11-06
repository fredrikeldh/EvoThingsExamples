'use strict';

/* jshint ignore:start */
var discoverTryBuyConfig = {
	isProduction: true
};
//coremetrics
var digitalData = {
	page: {
		pageInfo: {
			ibm: {
				siteID: 'DISCOVER-IOT'	//formerly IBM.WTMSite meta tag
			}
		},
		category: {
			primaryCategory: 'DISCOVER-IOT'		//formerly IBM.WTMCategory meta tag
		}
	}
}
console.log ("coremetrics digitalData PROD definition:" + JSON.stringify(digitalData));
function bindPageViewWithAnalytics(){console.info("coremetrics pageview called again");}
/* jshint ignore:end */
