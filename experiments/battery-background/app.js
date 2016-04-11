// JavaScript code for the Battery Demo app.

/**
 * Object that holds application data and functions.
 */
var app = {};

/**
 * Initialise the application.
 */
app.initialize = function()
{
	document.addEventListener(
		'deviceready',
		function() { evothings.scriptsLoaded(app.onDeviceReady) },
		false);

};

app.onDeviceReady = function()
{
	console.log("deviceReady");

	window.addEventListener("batterystatus", app.onBatteryStatus, false);
};

app.onBatteryStatus = function(status)
{
	console.log("batteryStatus "+JSON.stringify(status));
}

// Initialize the app.
app.initialize();
