// JavaScript code for the Thunderboard Sensors app.

var base64 = cordova.require('cordova/base64');

/**
 * Object that holds application data and functions.
 */
var app = {};

/**
 * Data that is plotted on the canvas.
 */
app.dataPoints = [];

/**
 * Timeout (ms) after which a message is shown if the Thunderboard wasn't found.
 */
app.CONNECT_TIMEOUT = 3000;

var UUID_SERVICE_GENERIC_ACCESS = "00001800-0000-1000-8000-00805f9b34fb"
var UUID_SERVICE_DEVICE_INFORMATION = "0000180a-0000-1000-8000-00805f9b34fb"
var UUID_SERVICE_BATTERY = "0000180f-0000-1000-8000-00805f9b34fb"
var UUID_SERVICE_AUTOMATION_IO = "00001815-0000-1000-8000-00805f9b34fb"
var UUID_SERVICE_CSC = "00001816-0000-1000-8000-00805f9b34fb"
var UUID_SERVICE_ENVIRONMENT_SENSING = "0000181a-0000-1000-8000-00805f9b34fb"
var UUID_SERVICE_ACCELERATION_ORIENTATION = "a4e649f4-4be5-11e5-885d-feff819cdc9f"
var UUID_SERVICE_AMBIENT_LIGHT = "d24c4f4e-17a7-4548-852c-abf51127368b"
var UUID_CHARACTERISTIC_DEVICE_NAME = "00002a00-0000-1000-8000-00805f9b34fb" // Generic Access Service
var UUID_CHARACTERISTIC_APPEARANCE = "00002a01-0000-1000-8000-00805f9b34fb"

var UUID_CHARACTERISTIC_MODEL_NUMBER = "00002a24-0000-1000-8000-00805f9b34fb"     // Device Information Service
var UUID_CHARACTERISTIC_FIRMWARE_REVISION = "00002a26-0000-1000-8000-00805f9b34fb"
var UUID_CHARACTERISTIC_HARDWARE_REVISION = "00002a27-0000-1000-8000-00805f9b34fb"
var UUID_CHARACTERISTIC_SOFTWARE_REVISION = "00002a28-0000-1000-8000-00805f9b34fb"
var UUID_CHARACTERISTIC_MANUFACTURER_NAME = "00002a29-0000-1000-8000-00805f9b34fb"
var UUID_CHARACTERISTIC_SYSTEM_ID = "00002a23-0000-1000-8000-00805f9b34fb"

var UUID_CHARACTERISTIC_BATTERY_LEVEL = "00002a19-0000-1000-8000-00805f9b34fb" // Battery Service
var UUID_CHARACTERISTIC_CSC_CONTROL_POINT = "00002a55-0000-1000-8000-00805f9b34fb" // CSC Service
var UUID_CHARACTERISTIC_CSC_MEASUREMENT = "00002a5b-0000-1000-8000-00805f9b34fb"
var UUID_CHARACTERISTIC_CSC_FEATURE = "00002a5c-0000-1000-8000-00805f9b34fb"
var UUID_CHARACTERISTIC_CSC_UNKNOWN = "9f70a8fc-826c-4c6f-9c72-41b81d1c9561"
var UUID_CHARACTERISTIC_HUMIDITY = "00002a6f-0000-1000-8000-00805f9b34fb" // Environment Service
var UUID_CHARACTERISTIC_TEMPERATURE = "00002a6e-0000-1000-8000-00805f9b34fb"
var UUID_CHARACTERISTIC_UV_INDEX = "00002a76-0000-1000-8000-00805f9b34fb"
var UUID_CHARACTERISTIC_AMBIENT_LIGHT = "c8546913-bfd9-45eb-8dde-9f8754f4a32e" // Ambient Light Service
var UUID_CHARACTERISTIC_ACCELERATION = "c4c1f6e2-4be5-11e5-885d-feff819cdc9f" // Accelarion and Orientation Service
var UUID_CHARACTERISTIC_ORIENTATION = "b7c4b694-bee3-45dd-ba9f-f3b5e994f49a"
var UUID_CHARACTERISTIC_CALIBRATE = "71e30b8c-4131-4703-b0a0-b0bbba75856b"
var UUID_DESCRIPTOR_CLIENT_CHARACTERISTIC_CONFIGURATION = "00002902-0000-1000-8000-00805f9b34fb" // Descriptors
var UUID_DESCRIPTOR_CHARACTERISTIC_PRESENTATION_FORMAT = "00002904-0000-1000-8000-00805f9b34fb"

// There are two characteristics with this UUID.
// One has Notify and is the Input char.
// The other has Write and is the Output char.
// EasyBLE's writeServiceCharacteristic will not help here, since both chars are in the same service.
var UUID_CHARACTERISTIC_DIGITAL = "00002a56-0000-1000-8000-00805f9b34fb" // Automation IO Service


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
	app.showInfo('Activate the Thunderboard and tap Start.');
	app.onStartButton();
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
	evothings.ble.stopScan();
	if(app.device && app.device.handle)
		evothings.ble.close(app.device.handle);
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
				'Please start the Thunderboard.');
		},
		app.CONNECT_TIMEOUT)
}

app.stopConnectTimer = function()
{
	clearTimeout(app.connectTimer);
}

app.startScan = function()
{
	evothings.ble.startScan(
		function(device)
		{
			// Connect if we have found an Thunderboard.
			if (app.deviceIsThunderboard(device))
			{
				app.showInfo('Status: Device found: ' + device.name + '.');
				evothings.ble.stopScan();
				app.connectToDevice(device);
				app.stopConnectTimer();
			}
		},
		function(errorCode)
		{
			app.showInfo('Error: startScan: ' + errorCode + '.');
		});
}

app.deviceIsThunderboard = function(device)
{
	app.ensureAdvertisementData(device)
	console.log('device name: "'+device.name+'" data: '+JSON.stringify(device.advertisementData));
	return (device != null) &&
		(device.name != null) &&
		((device.name.indexOf('Thunder React') > -1));
};

/**
 * Read services for a device.
 */
app.connectToDevice = function(device)
{
	app.showInfo('Connecting...');
	evothings.ble.connect(device.address,
		function(info)
		{
			device.handle = info.deviceHandle;
			app.showInfo('Status: Connected - reading Thunderboard services...');
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
	app.device = device;
	evothings.ble.readAllServiceData(device.handle,
		function(services)
		{
			device.services = services;
			app.readDeviceInfo(device);
			app.startNotifications(device);
		},
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

	app.notify(device, UUID_SERVICE_BATTERY, UUID_CHARACTERISTIC_BATTERY_LEVEL, 'BatteryCharge', uint8PercentageFormat);
/*
	// Notification is not supported on these sensors. You must poll/read.
	app.notify(device, UUID_SERVICE_ENVIRONMENT_SENSING, UUID_CHARACTERISTIC_HUMIDITY, 'Humidity', uint16Format);
	app.notify(device, UUID_SERVICE_ENVIRONMENT_SENSING, UUID_CHARACTERISTIC_TEMPERATURE, 'Temperature', sint16Format);
	app.notify(device, UUID_SERVICE_ENVIRONMENT_SENSING, UUID_CHARACTERISTIC_UV_INDEX, 'UVIndex', uint8Format);
	app.notify(device, UUID_SERVICE_AMBIENT_LIGHT, UUID_CHARACTERISTIC_AMBIENT_LIGHT, 'AmbientLight', uint32Format);
*/
	app.notify(device, UUID_SERVICE_ACCELERATION_ORIENTATION, UUID_CHARACTERISTIC_ACCELERATION, 'Acceleration', sint16Axis3Format);
	app.notify(device, UUID_SERVICE_ACCELERATION_ORIENTATION, UUID_CHARACTERISTIC_ORIENTATION, 'Orientation', sint16Axis3Format);

	app.setupAutomationService(device);
}

var sint16Format = function(data)
{
	var d = new Int16Array(data);
	return d[0];
}

var uint16Format = function(data)
{
	var d = new Uint16Array(data);
	return d[0];
}

var uint32Format = function(data)
{
	var d = new Uint32Array(data);
	return d[0];
}

var uint8Format = function(data)
{
	var d = new Uint8Array(data);
	return d[0];
}

var sint16Axis3Format = function(data)
{
	var d = new Int16Array(data);
	return 'x: '+d[0]+' y:'+d[1]+' z:'+d[2];
}

app.readDeviceInfo = function(device)
{
	app.readCharacteristic(device, UUID_SERVICE_GENERIC_ACCESS, UUID_CHARACTERISTIC_DEVICE_NAME, 'DeviceName');
	//app.readCharacteristic(device, UUID_SERVICE_GENERIC_ACCESS, UUID_CHARACTERISTIC_APPEARANCE, 'Appearance');

	app.readCharacteristic(device, UUID_SERVICE_DEVICE_INFORMATION, UUID_CHARACTERISTIC_MODEL_NUMBER, 'DeviceModel');
	app.readCharacteristic(device, UUID_SERVICE_DEVICE_INFORMATION, UUID_CHARACTERISTIC_FIRMWARE_REVISION, 'FirmwareRevision');
	app.readCharacteristic(device, UUID_SERVICE_DEVICE_INFORMATION, UUID_CHARACTERISTIC_HARDWARE_REVISION, 'HardwareRevision');
	app.readCharacteristic(device, UUID_SERVICE_DEVICE_INFORMATION, UUID_CHARACTERISTIC_SOFTWARE_REVISION, 'SoftwareRevision');
	app.readCharacteristic(device, UUID_SERVICE_DEVICE_INFORMATION, UUID_CHARACTERISTIC_SYSTEM_ID, 'SystemID');

	app.readCharacteristic(device, UUID_SERVICE_BATTERY, UUID_CHARACTERISTIC_BATTERY_LEVEL, 'BatteryCharge', uint8PercentageFormat);
}

//var humidityFormat

app.notify = function(device, serviceUUID, characteristicUUID, spanID, format)
{
	// Find handle
	var cHandle;
	for(let s of device.services) {
		if(s.uuid == serviceUUID) {
			for(let c of s.characteristics) {
				if(c.uuid == characteristicUUID) {
					cHandle = c.handle;
				}
			}
		}
	}
	// Read data
	if(!cHandle) {
		app.value(spanID, "N/A");
		return;
	}
	evothings.ble.enableNotification(device.handle, cHandle,
	function(data)
	{
		var str = format(data);
		//console.log(spanID+': '+str);
		app.value(spanID, str);
	},
	function(errorCode)
	{
		console.log('Error: enableNotification: ' + errorCode + '.');
	});
}

app.setupAutomationService = function(device)
{
	// Find handles
	for(let s of device.services) {
		if(s.uuid == UUID_SERVICE_AUTOMATION_IO) {
			for(let c of s.characteristics) {
				if(c.uuid == UUID_CHARACTERISTIC_DIGITAL) {
					if((c.properties & evothings.ble.property.PROPERTY_NOTIFY) != 0) {
						device.inputHandle = c.handle;
					}
					if((c.properties & evothings.ble.property.PROPERTY_WRITE) != 0) {
						// TODO: use this for LED control.
						device.outputHandle = c.handle;
					}
				}
			}
		}
	}

	// If handle was not found, mark the field as Not Available.
	if(!device.inputHandle) {
		app.value('SW-0', "N/A");
		app.value('SW-1', "N/A");
		return;
	}

	// Start notifications
	evothings.ble.enableNotification(device.handle, device.inputHandle,
	function(data)
	{
		var v = new Uint8Array(data)[0];
		console.log("notified: "+v);
		app.value('SW-0', ((v & 0x1) == 0) ? 'OFF' : 'ON');
		app.value('SW-1', ((v & 0x4) == 0) ? 'OFF' : 'ON');
	},
	function(errorCode)
	{
		console.log('Error: enableNotification: ' + errorCode + '.');
	});

	// Read data
	console.log("read buttons...");
	evothings.ble.readCharacteristic(device.handle, device.inputHandle,
	function(data)
	{
		var v = new Uint8Array(data)[0];
		console.log("buttons: "+v);
		app.value('SW-0', ((v & 0x1) == 0) ? 'OFF' : 'ON');
		app.value('SW-1', ((v & 0x4) == 0) ? 'OFF' : 'ON');
	},
	function(errorCode)
	{
		console.log('Error: readCharacteristic: ' + errorCode + '.');
	});
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

app.readCharacteristicUint16 = function(device, uuid, name)
{
	device.readCharacteristic(uuid, function(data)
	{
		console.log(name+': '+evothings.util.littleEndianToUint16(new Uint8Array(data), 0));
	},
	function(errorCode)
	{
		console.log('Error: readCharacteristic: ' + errorCode + '.');
	});
}

var uint8PercentageFormat = function(data) {
	return new Uint8Array(data)[0] + '%';
}

var utf8StringFormat = function(data) {
	return utf8ArrayToStr(data, function(out, c) {
		return out+'['+c+']';
	});
}

app.readCharacteristic = function(device, serviceUUID, characteristicUUID, spanID, format)
{
	format = format || utf8StringFormat;
	// Find handle
	var cHandle;
	for(let s of device.services) {
		if(s.uuid == serviceUUID) {
			for(let c of s.characteristics) {
				if(c.uuid == characteristicUUID) {
					cHandle = c.handle;
				}
			}
		}
	}
	// Read data
	if(!cHandle) {
		app.value(spanID, "N/A");
		return;
	}
	evothings.ble.readCharacteristic(device.handle, cHandle,
	function(data)
	{
		var str = format(data);
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
	var values = app.parseAccelerometerValues(new Uint8Array(data));
	app.value('Accelerometer', values.x+', '+values.y+', '+values.z);
}

/**
 * Calculate accelerometer values from raw data for Thunderboard.
 * @param data - an Uint8Array.
 * @return Object with fields: x, y, z.
 */
app.parseAccelerometerValues = function(data)
{
	// We want to scale the values to +/- 1.
	// Documentation says: "Values are in the range +/-1000 milli-newtons, little-endian."
	// Actual maximum values is measured to be 2048.
	var divisor = 2048;

	// Calculate accelerometer values.
	var rawX = evothings.util.littleEndianToInt16(data, 0);
	var rawY = evothings.util.littleEndianToInt16(data, 2);
	var rawZ = evothings.util.littleEndianToInt16(data, 4);
	var ax = rawX / divisor;
	var ay = rawY / divisor;
	var az = rawZ / divisor;

	/*
	// log raw values every now and then
	var now = new Date().getTime();	// current time in milliseconds since 1970.
	if(!app.lastLog || now > app.lastLog + 1000) {
		console.log([rawX, rawY, rawZ]);
		//console.log(evothings.util.typedArrayToHexString(data));
		app.lastLog = now;
	}
	*/

	// Return result.
	return { x: rawX, y: rawY, z: rawZ };
}

app.handleMagnetometerValues = function(data)
{
	var values = app.parseMagnetometerValues(new Uint8Array(data));
	app.value('MagnetometerAxes', values.x+', '+values.y+', '+values.z);
}

app.parseMagnetometerValues = function(data)
{
	var values = {
		x: evothings.util.littleEndianToUint16(data, 0),
		y: evothings.util.littleEndianToUint16(data, 2),
		z: evothings.util.littleEndianToUint16(data, 2),
	}
	return values;
}

app.handleMagnetometerBearing = function(data)
{
	data = new Uint8Array(data);
	// log raw values every now and then
	var now = new Date().getTime();	// current time in milliseconds since 1970.
	if(!app.lastLog || now > app.lastLog + 1000) {
		console.log(evothings.util.typedArrayToHexString(data));
		app.lastLog = now;
	}

	var value = evothings.util.littleEndianToUint16(data, 0);
	app.value('MagnetometerBearing', value);
}

app.handleTemperatureData = function(data)
{
	app.value('Temperature', evothings.util.littleEndianToInt8(new Uint8Array(data), 0)+' °C');
}

app.handleButtonA = function(data)
{
	app.value('ButtonA', evothings.util.littleEndianToInt8(new Uint8Array(data), 0));
}

app.handleButtonB = function(data)
{
	app.value('ButtonB', evothings.util.littleEndianToInt8(new Uint8Array(data), 0));
}

/**
 * If device already has advertisementData, does nothing.
 * If device instead has scanRecord, creates advertisementData.
 * See ble.js for AdvertisementData reference.
 * @param device - Device object.
 */
app.ensureAdvertisementData = function(device)
{
	// If device object already has advertisementData we
	// do not need to parse the scanRecord.
	if (device.advertisementData) { return; }

	// Must have scanRecord yo continue.
	if (!device.scanRecord) { return; }

	// Here we parse BLE/GAP Scan Response Data.
	// See the Bluetooth Specification, v4.0, Volume 3, Part C, Section 11,
	// for details.

	var byteArray = evothings.util.base64DecToArr(device.scanRecord);
	var pos = 0;
	var advertisementData = {};
	var serviceUUIDs;
	var serviceData;

	// The scan record is a list of structures.
	// Each structure has a length byte, a type byte, and (length-1) data bytes.
	// The format of the data bytes depends on the type.
	// Malformed scanRecords will likely cause an exception in this function.
	while (pos < byteArray.length)
	{
		var length = byteArray[pos++];
		if (length == 0)
		{
			break;
		}
		length -= 1;
		var type = byteArray[pos++];

		// Parse types we know and care about.
		// Skip other types.

		var BLUETOOTH_BASE_UUID = '-0000-1000-8000-00805f9b34fb'

		// Convert 16-byte Uint8Array to RFC-4122-formatted UUID.
		function arrayToUUID(array, offset)
		{
			var k=0;
			var string = '';
			var UUID_format = [4, 2, 2, 2, 6];
			for (var l=0; l<UUID_format.length; l++)
			{
				if (l != 0)
				{
					string += '-';
				}
				for (var j=0; j<UUID_format[l]; j++, k++)
				{
					string += evothings.util.toHexString(array[offset+k], 1);
				}
			}
			return string;
		}

		if (type == 0x02 || type == 0x03) // 16-bit Service Class UUIDs.
		{
			serviceUUIDs = serviceUUIDs ? serviceUUIDs : [];
			for(var i=0; i<length; i+=2)
			{
				serviceUUIDs.push(
					'0000' +
					evothings.util.toHexString(
						evothings.util.littleEndianToUint16(byteArray, pos + i),
						2) +
					BLUETOOTH_BASE_UUID);
			}
		}
		if (type == 0x04 || type == 0x05) // 32-bit Service Class UUIDs.
		{
			serviceUUIDs = serviceUUIDs ? serviceUUIDs : [];
			for (var i=0; i<length; i+=4)
			{
				serviceUUIDs.push(
					evothings.util.toHexString(
						evothings.util.littleEndianToUint32(byteArray, pos + i),
						4) +
					BLUETOOTH_BASE_UUID);
			}
		}
		if (type == 0x06 || type == 0x07) // 128-bit Service Class UUIDs.
		{
			serviceUUIDs = serviceUUIDs ? serviceUUIDs : [];
			for (var i=0; i<length; i+=16)
			{
				serviceUUIDs.push(arrayToUUID(byteArray, pos + i));
			}
		}
		if (type == 0x08 || type == 0x09) // Local Name.
		{
			advertisementData.kCBAdvDataLocalName = evothings.ble.fromUtf8(
				new Uint8Array(byteArray.buffer, pos, length));
		}
		if (type == 0x0a) // TX Power Level.
		{
			advertisementData.kCBAdvDataTxPowerLevel =
				evothings.util.littleEndianToInt8(byteArray, pos);
		}
		if (type == 0x16) // Service Data, 16-bit UUID.
		{
			serviceData = serviceData ? serviceData : {};
			var uuid =
				'0000' +
				evothings.util.toHexString(
					evothings.util.littleEndianToUint16(byteArray, pos),
					2) +
				BLUETOOTH_BASE_UUID;
			var data = new Uint8Array(byteArray.buffer, pos+2, length-2);
			serviceData[uuid] = base64.fromArrayBuffer(data);
		}
		if (type == 0x20) // Service Data, 32-bit UUID.
		{
			serviceData = serviceData ? serviceData : {};
			var uuid =
				evothings.util.toHexString(
					evothings.util.littleEndianToUint32(byteArray, pos),
					4) +
				BLUETOOTH_BASE_UUID;
			var data = new Uint8Array(byteArray.buffer, pos+4, length-4);
			serviceData[uuid] = base64.fromArrayBuffer(data);
		}
		if (type == 0x21) // Service Data, 128-bit UUID.
		{
			serviceData = serviceData ? serviceData : {};
			var uuid = arrayToUUID(byteArray, pos);
			var data = new Uint8Array(byteArray.buffer, pos+16, length-16);
			serviceData[uuid] = base64.fromArrayBuffer(data);
		}
		if (type == 0xff) // Manufacturer-specific Data.
		{
			// Annoying to have to transform base64 back and forth,
			// but it has to be done in order to maintain the API.
			advertisementData.kCBAdvDataManufacturerData =
				base64.fromArrayBuffer(new Uint8Array(byteArray.buffer, pos, length));
		}

		pos += length;
	}
	advertisementData.kCBAdvDataServiceUUIDs = serviceUUIDs;
	advertisementData.kCBAdvDataServiceData = serviceData;
	device.advertisementData = advertisementData;

	/*
	// Log raw data for debugging purposes.

	console.log("scanRecord: "+evothings.util.typedArrayToHexString(byteArray));

	console.log(JSON.stringify(advertisementData));
	*/
}


// Initialize the app.
app.initialize();
