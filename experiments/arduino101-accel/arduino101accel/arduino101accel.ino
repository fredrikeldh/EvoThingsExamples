/*
Copyright (c) 2016 Evothings.  All rights reserved.

This library is free software; you can redistribute it and/or
modify it under the terms of the GNU Lesser General Public
License as published by the Free Software Foundation; either
version 2.1 of the License, or (at your option) any later version.

This library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public
License along with this library; if not, write to the Free Software
Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA
*/

#include <CurieBle.h>
#include <CurieImu.h>

/*
This sketch implements a custom Bluetooth Low-Energy Accelerometer service.
*/

BLEPeripheral blePeripheral;	// BLE Peripheral Device (the board you're programming)
BLEService accelService("a26d61af-8344-4308-ad69-322fd7966482");	// Custom BLE Accelerometer Service

// BLE Battery Level Characteristic"
BLECharacteristic accelChar("42606e38-9a1b-482b-8281-b46e1941c000",	// custom 128-bit characteristic UUID
	BLERead | BLENotify, 6);	// remote clients will be able to get notifications if this characteristic changes

long previousMillis = 0;	// last time the accelerometer was updated, in ms

void setup() {
	Serial.begin(9600);	// initialize serial communication
	pinMode(13, OUTPUT);	// initialize the LED on pin 13 to indicate when a central is connected

	CurieImu.initialize();
	// verify connection
	Serial.println("Testing CurieImu connection...");
	if (CurieImu.testConnection()) {
		Serial.println("CurieImu connection successful");
	} else {
		Serial.println("CurieImu connection failed");
	}

	/* Set a local name for the BLE device
		This name will appear in advertising packets
		and can be used by remote devices to identify this BLE device
		The name can be changed but maybe be truncated based on space left in advertisement packet */
	blePeripheral.setLocalName("Accel101");
	blePeripheral.setAdvertisedServiceUuid(accelService.uuid());  // advertise the service UUID
	blePeripheral.addAttribute(accelService);
	blePeripheral.addAttribute(accelChar);

	/* Now activate the BLE device.  It will start continuously transmitting BLE
		advertising packets and will be visible to remote BLE central devices
		until it receives a new connection */
	blePeripheral.begin();
	Serial.println("Bluetooth device active, waiting for connections...");
}

void loop() {
	// listen for BLE peripherals to connect:
	BLECentral central = blePeripheral.central();

	// if a central is connected to peripheral:
	if (central) {
		Serial.print("Connected to central: ");
		// print the central's MAC address:
		Serial.println(central.address());
		// turn on the LED to indicate the connection:
		digitalWrite(13, HIGH);

		// update the accelerometer every 50ms
		// as long as the central is still connected:
		while (central.connected()) {
			long currentMillis = millis();
			if (currentMillis - previousMillis >= 50) {
				previousMillis = currentMillis;
				updateAccelerometer();
			}
		}
		// when the central disconnects, turn off the LED:
		digitalWrite(13, LOW);
		Serial.print("Disconnected from central: ");
		Serial.println(central.address());
	}
}

void updateAccelerometer() {
	int16_t val[3];
	CurieImu.getAcceleration(val+0, val+1, val+2);
	accelChar.setValue((byte*)val, sizeof(val));
}
