// JavaScript code for the BoschXDK Demo app.

/**
 * Object that holds application data and functions.
 */
var app = {};

/**
 * Data that is plotted on the canvas.
 */
app.dataPoints = [];

/**
 * Timeout (ms) after which a message is shown if the BoschXDK wasn't found.
 */
app.CONNECT_TIMEOUT = 3000;

/**
 * Object that holds BoschXDK UUIDs.
 */
app.bosch = {};

app.bosch.ACCELEROMETER_SERVICE = '00005301-0000-0041-4c50-574953450000';
app.bosch.ACCELEROMETER_CONTROL = '00005302-0000-0041-4c50-574953450000';
app.bosch.ACCELEROMETER_DATA = '00005303-0000-0041-4c50-574953450000';

var BLE_NOTIFICATION_UUID = '00002902-0000-1000-8000-00805f9b34fb';

/**
 * Initialise the application.
 */
app.initialize = function()
{
	document.addEventListener(
		'deviceready',
		function() { evothings.scriptsLoaded(app.onDeviceReady) },
		false);

	// Called when HTML page has been loaded.
	$(document).ready( function()
	{
		// Adjust canvas size when browser resizes
		$(window).resize(app.respondCanvas);

		// Adjust the canvas size when the document has loaded.
		app.respondCanvas();
	});
};

/**
 * Adjust the canvas dimensions based on its container's dimensions.
 */
app.respondCanvas = function()
{
	var canvas = $('#canvas')
	var container = $(canvas).parent()
	canvas.attr('width', $(container).width() ) // Max width
	// Not used: canvas.attr('height', $(container).height() ) // Max height
};

function onConnect(context) {
  // Once a connection has been made, make a subscription and send a message.
  console.log("Client Connected");
  console.log(context);
}

app.onDeviceReady = function()
{
	app.showInfo('Activate the BoschXDK and tap Start.');
};

app.showInfo = function(info)
{
	console.log(info)
	document.getElementById('info').innerHTML = info;
};

app.onStartButton = function()
{
	app.onStopButton();
	app.startScan();
	app.showInfo('Status: Scanning...');
	app.startConnectTimer();
};

app.onStopButton = function()
{
	// Stop any ongoing scan and close devices.
	app.stopConnectTimer();
	evothings.easyble.stopScan();
	evothings.easyble.closeConnectedDevices();
	app.showInfo('Status: Stopped.');
};

app.startConnectTimer = function()
{
	// If connection is not made within the timeout
	// period, an error message is shown.
	app.connectTimer = setTimeout(
		function()
		{
			app.showInfo('Status: Scanning... ' +
				'Please start the BoschXDK.');
		},
		app.CONNECT_TIMEOUT)
}

app.stopConnectTimer = function()
{
	clearTimeout(app.connectTimer);
}

app.startScan = function()
{
	evothings.easyble.startScan(
		function(device)
		{
			// Connect if we have found an BoschXDK.
			if (app.deviceIsBoschXDK(device))
			{
				app.showInfo('Status: Device found: ' + device.name + '.');
				evothings.easyble.stopScan();
				app.connectToDevice(device);
				app.stopConnectTimer();
			}
		},
		function(errorCode)
		{
			app.showInfo('Error: startScan: ' + errorCode + '.');
		});
};

app.deviceIsBoschXDK = function(device)
{
	console.log('device name: ' + device.name + ' '+JSON.stringify(device.advertisementData.kCBAdvDataServiceUUIDs));
	// The program we want advertises the accelerometer service.
	// This way, we don't need to rely on device names.
	return (device != null) &&
		(device.advertisementData != null) &&
		(device.advertisementData.kCBAdvDataServiceUUIDs != null) &&
		(device.advertisementData.kCBAdvDataServiceUUIDs[0].toLowerCase() == app.bosch.ACCELEROMETER_SERVICE);
};

/**
 * Read services for a device.
 */
app.connectToDevice = function(device)
{
	app.showInfo('Connecting...');
	device.connect(
		function(device)
		{
			app.showInfo('Status: Connected - reading BoschXDK services...');
			app.readServices(device);
		},
		function(errorCode)
		{
			app.showInfo('Error: Connection failed: ' + errorCode + '.');
			evothings.ble.reset();
			// This can cause an infinite loop...
			//app.connectToDevice(device);
		});
};

app.readServices = function(device)
{
	device.readServices(
		/*[
		app.bosch.ACCELEROMETER_SERVICE, // Accelerometer service UUID.
		]*/null,
		// Function that monitors accelerometer data.
		app.startAccelerometerNotification,
		// Use this function to monitor magnetometer data
		// (comment out the above line if you try this).
		//app.startMagnetometerNotification,
		function(errorCode)
		{
			console.log('Error: Failed to read services: ' + errorCode + '.');
		});
};

/**
 * Read accelerometer data.
 */
app.startAccelerometerNotification = function(device)
{
	app.showInfo('Status: Starting accelerometer notification...');
	// Set accelerometer notification to ON.
	device.writeDescriptor(
		app.bosch.ACCELEROMETER_DATA,
		BLE_NOTIFICATION_UUID,
		new Uint8Array([1,0]),
		function()
		{
			console.log('Status: writeDescriptor ok.');

	// Send "start" command.
	device.writeCharacteristic(
		app.bosch.ACCELEROMETER_CONTROL,
		evothings.ble.toUtf8("start"),
		function()
		{
			console.log('Status: writeCharacteristic ok.');
		},
		function(errorCode)
		{
			app.showInfo('Error: writeCharacteristic: ' + errorCode + '.');
		});


		},
		function(errorCode)
		{
			// This error will happen on iOS, since this descriptor is not
			// listed when requesting descriptors. On iOS you are not allowed
			// to use the configuration descriptor explicitly. It should be
			// safe to ignore this error.
			console.log('Error: writeDescriptor: ' + errorCode + '.');
		});

	// Start accelerometer notification.
	device.enableNotification(
		app.bosch.ACCELEROMETER_DATA,
		function(data)
		{
			app.showInfo('Status: Data stream active - accelerometer');
			var dataArray = new Uint8Array(data);
			console.log(evothings.util.typedArrayToHexString(data));
			var values = app.getAccelerometerValues(dataArray);
			app.drawDiagram(values);
		},
		function(errorCode)
		{
			console.log('Error: enableNotification: ' + errorCode + '.');
		});
};

/**
 * Calculate accelerometer values from raw data for BoschXDK.
 * @param data - an Uint8Array.
 * @return Object with fields: x, y, z.
 */
app.getAccelerometerValues = function(data)
{
	// We want to scale the values to +/- 1.
	// Default range for the accelerometer is +/- 2^14 (16384).
	var divisor = 1 << 14;

	// Calculate accelerometer values.
	var rawX = evothings.util.littleEndianToInt16(data, 0);
	var rawY = evothings.util.littleEndianToInt16(data, 2);
	var rawZ = evothings.util.littleEndianToInt16(data, 4);
	var ax = rawX / divisor;
	var ay = rawY / divisor;
	var az = rawZ / divisor;

	// log raw values every now and then
	var now = new Date().getTime();	// current time in milliseconds since 1970.
	if(!app.lastLog || now > app.lastLog + 100) {
		console.log([rawX, rawY, rawZ]);
		//console.log(evothings.util.typedArrayToHexString(data));
		app.lastLog = now;
	}

	// Return result.
	return { x: ax, y: ay, z: az };
};

/**
 * Plot diagram of sensor values.
 * Values plotted are expected to be between -1 and 1
 * and in the form of objects with fields x, y, z.
 */
app.drawDiagram = function(values)
{
	var canvas = document.getElementById('canvas');
	var context = canvas.getContext('2d');

	// Add recent values.
	app.dataPoints.push(values);

	// Remove data points that do not fit the canvas.
	if (app.dataPoints.length > canvas.width)
	{
		app.dataPoints.splice(0, (app.dataPoints.length - canvas.width));
	}

	// Value is an accelerometer reading between -1 and 1.
	function calcDiagramY(value)
	{
		// Return Y coordinate for this value.
		var diagramY =
			((value * (canvas.height-1)) / 2)
			+ ((canvas.height-1) / 2);
		return diagramY;
	}

	function drawLine(axis, color)
	{
		context.strokeStyle = color;
		context.beginPath();
		var lastDiagramY = calcDiagramY(
			app.dataPoints[app.dataPoints.length-1][axis]);
		context.moveTo(0, lastDiagramY);
		var x = 1;
		for (var i = app.dataPoints.length - 2; i >= 0; i--)
		{
			var y = calcDiagramY(app.dataPoints[i][axis]);
			context.lineTo(x, y);
			x++;
		}
		context.stroke();
	}

	// Clear background.
	context.clearRect(0, 0, canvas.width, canvas.height);

	// Draw lines.
	drawLine('x', '#f00');
	drawLine('y', '#0f0');
	drawLine('z', '#00f');
};

// Initialize the app.
app.initialize();
