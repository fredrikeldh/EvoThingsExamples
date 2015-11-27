// JavaScript code for the automax Demo app.

/**
 * Object that holds application data and functions.
 */
var app = {};

/**
 * Data that is plotted on the canvas.
 */
app.dataPoints = [];

/**
 * Timeout (ms) after which a message is shown if the automax wasn't found.
 */
app.CONNECT_TIMEOUT = 3000;

/**
 * Object that holds automax UUIDs.
 */
app.automax = {};

app.automax.ACCELEROMETER_SERVICE = '0000ffb0-0000-1000-8000-00805f9b34fb';
app.automax.ACCELEROMETER_DATA = '0000ffb1-0000-1000-8000-00805f9b34fb';
app.automax.GYROSCOPE_ODR = '0000ffb2-0000-1000-8000-00805f9b34fb';
app.automax.ACCELEROMETER_ODR = '0000ffb3-0000-1000-8000-00805f9b34fb';

app.automax.HUMIDITY_SERVICE = '0000ffc0-0000-1000-8000-00805f9b34fb';
app.automax.HUMIDITY_DATA = '0000ffc1-0000-1000-8000-00805f9b34fb';
app.automax.HUMIDITY_READOUT_SPEED = '0000ffc2-0000-1000-8000-00805f9b34fb';

app.automax.DEVICE_INFO_SERVICE = '0000180a-0000-1000-8000-00805f9b34fb';
app.automax.DEVICE_MODEL = '00002a24-0000-1000-8000-00805f9b34fb';
app.automax.SERIAL_NUMBER = '00002a25-0000-1000-8000-00805f9b34fb';
app.automax.FIRMWARE_REVISION = '00002a26-0000-1000-8000-00805f9b34fb';
app.automax.HARDWARE_REVISION = '00002a27-0000-1000-8000-00805f9b34fb';
app.automax.SOFTWARE_REVISION = '00002a28-0000-1000-8000-00805f9b34fb';
app.automax.MANUFACTURER = '00002a29-0000-1000-8000-00805f9b34fb';
app.automax.IEEE = '00002a2a-0000-1000-8000-00805f9b34fb';

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
}

function onConnect(context) {
  // Once a connection has been made, make a subscription and send a message.
  console.log("Client Connected");
  console.log(context);
}

app.onDeviceReady = function()
{
	app.showInfo('Activate the Automax and tap Start.');
}

app.showInfo = function(info)
{
	document.getElementById('Status').innerHTML = info;
}

app.onStartButton = function()
{
	app.onStopButton();
	app.startScan();
	app.showInfo('Status: Scanning...');
	app.startConnectTimer();
}

app.onStopButton = function()
{
	// Stop any ongoing scan and close devices.
	app.stopConnectTimer();
	evothings.easyble.stopScan();
	evothings.easyble.closeConnectedDevices();
	app.showInfo('Status: Stopped.');
}

app.startConnectTimer = function()
{
	// If connection is not made within the timeout
	// period, an error message is shown.
	app.connectTimer = setTimeout(
		function()
		{
			app.showInfo('Status: Scanning... ' +
				'Please start the Automax.');
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
			// Connect if we have found an Automax.
			if (app.deviceIsAutomax(device))
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
}

app.deviceIsAutomax = function(device)
{
	console.log('device name: ' + device.name);
	return (device != null) &&
		(device.name != null) &&
		(device.name.indexOf('AUTOMAX') > -1);
}

/**
 * Read services for a device.
 */
app.connectToDevice = function(device)
{
	app.showInfo('Connecting...');
	device.connect(
		function(device)
		{
			app.showInfo('Status: Connected - reading Automax services...');
			app.readServices(device);
		},
		function(errorCode)
		{
			app.showInfo('Error: Connection failed: ' + errorCode + '.');
			evothings.ble.reset();
			// This can cause an infinite loop...
			//app.connectToDevice(device);
		});
}

app.readServices = function(device)
{
	device.readServices(
		[
		app.automax.ACCELEROMETER_SERVICE,
		app.automax.HUMIDITY_SERVICE,
		app.automax.DEVICE_INFO_SERVICE,
		],
		app.startNotifications,
		function(errorCode)
		{
			console.log('Error: Failed to read services: ' + errorCode + '.');
		});
}

app.writeCharacteristic = function(device, characteristicUUID, value) {
	device.writeCharacteristic(
		characteristicUUID,
		new Uint8Array(value),
		function()
		{
			console.log('writeCharacteristic '+characteristicUUID+' ok.');
		},
		function(errorCode)
		{
			// This error will happen on iOS, since this descriptor is not
			// listed when requesting descriptors. On iOS you are not allowed
			// to use the configuration descriptor explicitly. It should be
			// safe to ignore this error.
			console.log('Error: writeCharacteristic: ' + errorCode + '.');
		});
}

app.writeNotificationDescriptor = function(device, characteristicUUID)
{
	device.writeDescriptor(
		characteristicUUID,
		BLE_NOTIFICATION_UUID,
		new Uint8Array([1,0]),
		function()
		{
			console.log('writeDescriptor '+characteristicUUID+' ok.');
		},
		function(errorCode)
		{
			// This error will happen on iOS, since this descriptor is not
			// listed when requesting descriptors. On iOS you are not allowed
			// to use the configuration descriptor explicitly. It should be
			// safe to ignore this error.
			console.log('Error: writeDescriptor: ' + errorCode + '.');
		});
}

/**
 * Read accelerometer data.
 * FirmwareManualBaseBoard-v1.5.x.pdf
 */
app.startNotifications = function(device)
{
	app.showInfo('Status: Starting notifications...');

	app.readDeviceInfo(device);

	// Set notifications to ON.
	app.writeNotificationDescriptor(device, app.automax.ACCELEROMETER_DATA);
	app.writeNotificationDescriptor(device, app.automax.HUMIDITY_DATA);

	// Set sensors to 13 hz. We don't need any faster.
	app.writeCharacteristic(device, app.automax.ACCELEROMETER_ODR, [1]);
	app.writeCharacteristic(device, app.automax.GYROSCOPE_ODR, [1]);

	// Start accelerometer notification.
	device.enableNotification(
		app.automax.ACCELEROMETER_DATA,
		app.handleAccelerometerValues,
		function(errorCode)
		{
			console.log('Error: enableNotification: ' + errorCode + '.');
		});

	// Set humidity sensor speed to 1 hz?
	app.writeCharacteristic(device, app.automax.HUMIDITY_READOUT_SPEED, [0, 1]);

	// Start humdity notification.
	device.enableNotification(
		app.automax.HUMIDITY_DATA,
		app.handleHumidityValues,
		function(errorCode)
		{
			console.log('Error: enableNotification: ' + errorCode + '.');
		});
}

app.readDeviceInfo = function(device)
{
	app.readCharacteristic(device, app.automax.DEVICE_MODEL, 'DeviceModel');
	app.readCharacteristic(device, app.automax.SERIAL_NUMBER, 'SerialNumber');
	app.readCharacteristic(device, app.automax.FIRMWARE_REVISION, 'FirmwareRevision');
	app.readCharacteristic(device, app.automax.HARDWARE_REVISION, 'HardwareRevision');
	app.readCharacteristic(device, app.automax.SOFTWARE_REVISION, 'SoftwareRevision');
	app.readCharacteristic(device, app.automax.MANUFACTURER, 'Manufacturer');
	app.readCharacteristic(device, app.automax.IEEE, 'IEEE');
}

// http://www.onicos.com/staff/iz/amuse/javascript/expert/utf.txt
/* utf.js - utf-8 <=> UTF-16 conversion
*
* Copyright (C) 1999 Masanao Izumo <iz@onicos.co.jp>
* Version: 1.1
* LastModified: Nov 27 2015
* This library is free. You can redistribute it and/or modify it.
*/
function utf8ArrayToStr(array, errorHandler) {
	var out, i, len, c;
	var char2, char3;
	array = new Uint8Array(array);
	out = "";
	len = array.length;
	i = 0;
	while(i < len) {
		c = array[i++];
		switch(c >> 4) {
		case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:
			// 0xxxxxxx
			out += String.fromCharCode(c);
			break;
		case 12: case 13:
			// 110x xxxx 10xx xxxx
			char2 = array[i++];
			out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
			break;
		case 14:
			// 1110 xxxx 10xx xxxx 10xx xxxx
			char2 = array[i++];
			char3 = array[i++];
			out += String.fromCharCode(((c & 0x0F) << 12) |
			((char2 & 0x3F) << 6) |
			((char3 & 0x3F) << 0));
			break;
		default:
			if(errorHandler)
				out = errorHandler(out, c)
			else
				throw "Invalid UTF-8!";
		}
	}
	return out;
}

app.readCharacteristic = function(device, uuid, spanID)
{
	device.readCharacteristic(uuid, function(data)
	{
		var str = utf8ArrayToStr(data, function(out, c) {
			return out+'['+c+']';
		});
		console.log(spanID+': '+str);
		app.value(spanID, str);
	},
	function(errorCode)
	{
		console.log('Error: readCharacteristic: ' + errorCode + '.');
	});
}

app.value = function(elementId, value)
{
	document.getElementById(elementId).innerHTML = value;
}

app.handleAccelerometerValues = function(data)
{
	var values = app.getAccelerometerValues(new Uint8Array(data));
	app.value('Counter', values.counter);
	app.value('Temperature', values.temperature+' °C?');
	app.value('Accelerometer', values.ax.toPrecision(2)+', '+values.ay.toPrecision(2)+', '+values.az.toPrecision(2));
	app.value('Gyroscope', values.gx.toPrecision(2)+', '+values.gy.toPrecision(2)+', '+values.gz.toPrecision(2));
}

/**
 * Calculate accelerometer values from raw data for Automax.
 * @param data - an Uint8Array.
 * @return Object with fields: x, y, z.
 */
app.getAccelerometerValues = function(data)
{
	// TODO: Set divisor based on FFB5.
	// Default limit is 2 g. Max int16 is 32*1024.
	// We want to scale the values to g.
	var accDivisor = 32*1024 / 2;

	// Scale gyro to Degrees Per Second. Default limit is 125.
	var gyroDivisor = 32*1024 / 125;

	// Calculate values.
	var values = {
		gx: evothings.util.bigEndianToInt16(data, 0) / gyroDivisor,
		gy: evothings.util.bigEndianToInt16(data, 2) / gyroDivisor,
		gz: evothings.util.bigEndianToInt16(data, 4) / gyroDivisor,

		ax: evothings.util.bigEndianToInt16(data, 6) / accDivisor,
		ay: evothings.util.bigEndianToInt16(data, 8) / accDivisor,
		az: evothings.util.bigEndianToInt16(data, 10) / accDivisor,

		temperature: evothings.util.littleEndianToInt16(data, 12),

		counter: evothings.util.littleEndianToUint8(data, 14),
	}

	/*
	// log raw values every now and then
	var now = new Date().getTime();	// current time in milliseconds since 1970.
	if(!app.lastLog || now > app.lastLog + 1000) {
		console.log(evothings.util.typedArrayToHexString(data));
		console.log(JSON.stringify(values));
		console.log(evothings.util.bigEndianToInt16(data, 0));
		app.lastLog = now;
	}
	*/

	return values;
}

app.handleHumidityValues = function(data)
{
	var values = app.getHumidityValues(new Uint8Array(data));
	app.value('Temperature2', values.temperature+' °C');
	app.value('Humidity', values.humidity+' %');
}

app.getHumidityValues = function(data)
{
	var values = {
		temperature: evothings.util.bigEndianToInt16(data, 0) / 100,
		humidity: evothings.util.bigEndianToInt16(data, 2) / 100,
	}
	return values;
}

// Initialize the app.
app.initialize();
