# Build script for Evothings Example apps.
#
# How to run:
# ruby build.rb
#

require 'fileutils'

include FileUtils::Verbose

###### Examples ######

def buildMbedGAP
	destPath = 'examples/mbed-custom-gap'
	copyCommon(destPath)
	copyJQuery(destPath)
	copyEasyBLE(destPath)
	copyUtil(destPath)
end

def buildMbedGATT
	destPath = 'examples/mbed-custom-gatt'
	copyCommon(destPath)
	copyJQuery(destPath)
	copyEasyBLE(destPath)
	copyUtil(destPath)
end

def buildArduinoBLE
	destPath = 'examples/arduino-ble/app'
	copyCommon(destPath)
	copyJQuery(destPath)
	copyWhereIsTheArduinoCode(destPath)
end

def buildArduinoInputTCP
	# Copy CSS/JS files.
	destPath = 'examples/arduino-input-tcp/app'
	copyCommon(destPath)
	copyJQuery(destPath)
	copyArduinoTCP(destPath)
	copyWhereIsTheArduinoCode(destPath)

	# Copy Arduino files.
	destPath = 'examples/arduino-input-tcp'
	copyArduinoEthernet(destPath)
	copyArduinoWiFi(destPath)
end

def buildArduinoLEDOnOffBLE
	destPath = 'examples/arduino-led-onoff-ble/app'
	copyCommon(destPath)
	copyJQuery(destPath)
	copyArduinoBLE(destPath)
	copyWhereIsTheArduinoCode(destPath)
end

def buildArduinoLEDOnOffTCP
	# Copy CSS/JS files.
	destPath = 'examples/arduino-led-onoff-tcp/app'
	copyCommon(destPath)
	copyJQuery(destPath)
	copyArduinoTCP(destPath)
	copyWhereIsTheArduinoCode(destPath)

	# Copy Arduino files.
	destPath = 'examples/arduino-led-onoff-tcp'
	copyArduinoEthernet(destPath)
	copyArduinoWiFi(destPath)
end

def buildArduinoScriptableTCP
	# Copy CSS/JS files.
	destPath = 'examples/arduino-scriptable-tcp/app'
	copyCommon(destPath)
	copyJQuery(destPath)
	copyArduinoTCP(destPath)
	copyWhereIsTheArduinoCode(destPath)

	# Copy Arduino files.
	destPath = 'examples/arduino-scriptable-tcp'
	copyArduinoEthernet(destPath)
	copyArduinoWiFi(destPath)
end

def buildBLEScan
	destPath = 'examples/ble-scan'
	copyCommon(destPath)
	copyJQuery(destPath)
end

def buildTISensorTagCC2541Demo
	destPath = 'examples/ti-sensortag-cc2541-demo'
	copyCommon(destPath)
	copyJQuery(destPath)
	copyEasyBLE(destPath)
end

def buildTISensorTagCC2650Demo
	destPath = 'examples/ti-sensortag-cc2650-demo'
	copyCommon(destPath)
	copyJQuery(destPath)
	copyEasyBLE(destPath)
end

def buildTISensorTagSensors
	destPath = 'examples/ti-sensortag-sensors'
	copyCommon(destPath)
	copyUtil(destPath)
	copyTISensorTag(destPath)
end

def buildTISensorTagAccelerometer
	destPath = 'examples/ti-sensortag-accelerometer'
	copyCommon(destPath)
	copyUtil(destPath)
	copyTISensorTag(destPath)
end

def buildCordovaAccelerometer
	destPath = 'examples/cordova-accelerometer'
	copyCommon(destPath)
	copyJQuery(destPath)
end

def buildCordovaBasic
	destPath = 'examples/cordova-basic'
	copyCommon(destPath)
	copyJQuery(destPath)
end

def buildHelloWorld
	destPath = 'examples/hello-world'
	copyCommon(destPath)
end

def buildHueLights
	destPath = 'examples/hue-lights'
	copyCommon(destPath)
	copyJQuery(destPath)
end

def buildEddystoneScan
	destPath = 'examples/eddystone-scan'
	copyCommon(destPath)
	copyEddystone(destPath)
	copyJQuery(destPath)
end

def buildIBeaconScan
	destPath = 'examples/ibeacon-scan'
	copyCommon(destPath)
	copyJQuery(destPath)
end

def buildEstimoteBeacons
	destPath = 'examples/estimote-beacons'
	copyCommon(destPath)
	copyJQuery(destPath)
end

def buildEstimoteNearables
	destPath = 'examples/estimote-nearables'
	copyCommon(destPath)
	copyJQuery(destPath)
end

def buildNordic_nRF51822EK_BLE
	destPath = 'examples/nordic-nRF51822-ek-ble'
	copyCommon(destPath)
	copyJQuery(destPath)
	copyNordic_nRF51822_BLE(destPath)
end

def buildNordic_nRF51DK_BLE
	destPath = 'examples/nordic-nRF51-dk-ble/app'
	copyCommon(destPath)
	copyJQuery(destPath)
	copyNordic_nRF51_BLE(destPath)
end

def buildRFduinoLEDOnOff
	destPath = 'examples/rfduino-led-onoff/app'
	copyCommon(destPath)
	copyJQuery(destPath)
	copyRFduinoBLE(destPath)
	copyWhereIsTheArduinoCode(destPath)
end

def buildLightblueBeanBasic
	destPath = 'examples/lightblue-bean-basic/app'
	copyCommon(destPath)
	copyEasyBLE(destPath)
end

def buildRedBearLabSimpleControl
	destPath = 'examples/redbearlab-simplecontrol'
	copyCommon(destPath)
	copyEasyBLE(destPath)
	copyJQuery(destPath)
end

def buildRedBearLabSimpleChat
	destPath = 'examples/redbearlab-simplechat'
	copyCommon(destPath)
	copyEasyBLE(destPath)
	copyJQuery(destPath)
end

def buildBlunoHelloWorld
	destPath = 'examples/bluno-helloworld/app'
	copyCommon(destPath)
	copyEasyBLE(destPath)
	copyJQuery(destPath)
end

def buildLightblueBeanSerial
	destPath = 'experiments/lightblue-bean-serial'
	copyCommon(destPath)
	copyUtil(destPath)
end

def buildMediaTekLinkIt
	destPath = 'examples/mediatek-linkit/app'
	copyUI(destPath)
	copyJQuery(destPath)
end

def buildMediaTekLinkItConnect
	destPath = 'examples/mediatek-linkit-connect/app'
	copyCommon(destPath)
	copyJQuery(destPath)
end

def buildBlePeripheral
	destPath = 'experiments/ble-peripheral'
	copyUtil(destPath)
end

def buildEsp8266
	destPath = 'examples/esp8266/app'
	copyCommon(destPath)
	copyJQuery(destPath)
end

def buildMqtt3js
	destPath = 'experiments/mqtt-3js'
	copyCommon(destPath)
	copyMQTT(destPath)
end

def buildMqttPainter
	destPath = 'experiments/mqtt-painter'
	copyCommon(destPath)
	copyMQTT(destPath)
end

def buildMqttPaintHistory
	destPath = 'experiments/mqtt-paint-history'
	copyCommon(destPath)
	copyMQTT(destPath)
end

def buildSitesuck
	destPath = 'experiments/sitesuck'
	copyCommon(destPath)
	copyMQTT(destPath)
end

def buildAutomax
	destPath = 'experiments/Automax'
	copyCommon(destPath)
	copyJQuery(destPath)
	copyEasyBLE(destPath)
end

def buildAutomaxSensors
	destPath = 'experiments/Automax-sensors'
	copyCommon(destPath)
	copyEasyBLE(destPath)
end

################################# Copy helpers #################################

### CSS/JS ###

def copyCommon(destPath)
	copyUI(destPath)
	copyEvothings(destPath)
end

def copyUI(destPath)
	copyDir('resources/ui', destPath)
	copyDir('resources/libs/evothings/ui', destPath + '/libs/evothings')
end

def copyJQuery(destPath)
	copyDir('resources/libs/jquery', destPath + '/libs')
end

def copyEvothings(destPath)
	copyDir('resources/libs/evothings/evothings.js', destPath + '/libs/evothings')
	copyDir('resources/libs/evothings/version-1.2.0', destPath + '/libs/evothings')
end

def copyEasyBLE(destPath)
	copyUtil(destPath)
	copyDir('resources/libs/evothings/easyble', destPath + '/libs/evothings')
end

def copyArduinoBLE(destPath)
	copyEasyBLE(destPath)
	copyDir('resources/libs/evothings/arduinoble', destPath + '/libs/evothings')
end

def copyArduinoTCP(destPath)
	copyDir('resources/libs/evothings/arduinotcp', destPath + '/libs/evothings')
end

def copyNordic_nRF51822_BLE(destPath)
	copyEasyBLE(destPath)
	copyDir('resources/libs/evothings/nordic-nRF51822-ble', destPath + '/libs/evothings')
end

def copyNordic_nRF51_BLE(destPath)
	copyEasyBLE(destPath)
	copyDir('resources/libs/evothings/nordic-nRF51-ble', destPath + '/libs/evothings')
end

def copyRFduinoBLE(destPath)
	copyEasyBLE(destPath)
	copyDir('resources/libs/evothings/rfduinoble', destPath + '/libs/evothings')
end

def copyTISensorTag(destPath)
	copyEasyBLE(destPath)
	copyDir('resources/libs/evothings/tisensortag', destPath + '/libs/evothings')
end

def copyEddystone(destPath)
	copyEasyBLE(destPath)
	copyDir('resources/libs/evothings/eddystone', destPath + '/libs/evothings')
end

def copyUtil(destPath)
	copyDir('resources/libs/evothings/util', destPath + '/libs/evothings')
end

def copyMQTT(destPath)
	copyDir('resources/libs/mqtt/mqttws31.js', destPath + '/libs/')
end

def copyWhereIsTheArduinoCode(destPath)
	copyFile(
		'resources/txt/where-is-the-arduino-code.txt',
		destPath + '/where-is-the-arduino-code.txt')
end

### Arduino .ino files ###

def copyArduinoEthernet(destPath)
	copyDir('resources/arduino/arduinoethernet', destPath + '/arduinoethernet')
end

def copyArduinoWiFi(destPath)
	copyDir('resources/arduino/arduinowifi', destPath + '/arduinowifi')
end

### General copy methods ###

def copyDir(srcPath, destPath)
	mkpath(destPath)
	cp_r(srcPath, destPath)
end

def copyFile(srcPath, destPath)
	cp(srcPath, destPath)
end

###### Script entry point ######

def build
	buildBlePeripheral
	buildMbedGAP
	buildMbedGATT
	buildArduinoBLE
	buildArduinoInputTCP
	buildArduinoLEDOnOffBLE
	buildArduinoLEDOnOffTCP
	buildArduinoScriptableTCP
	buildBLEScan
	buildBlunoHelloWorld
	buildCordovaAccelerometer
	buildCordovaBasic
	buildEstimoteBeacons
	buildEstimoteNearables
	buildHelloWorld
	buildHueLights
	buildEddystoneScan
	buildIBeaconScan
	buildLightblueBeanBasic
	buildLightblueBeanSerial
	buildNordic_nRF51822EK_BLE
	buildNordic_nRF51DK_BLE
	buildRedBearLabSimpleChat
	buildRedBearLabSimpleControl
	buildRFduinoLEDOnOff
	buildTISensorTagCC2541Demo
	buildTISensorTagCC2650Demo
	buildTISensorTagSensors
	buildTISensorTagAccelerometer
	buildMediaTekLinkIt
	buildMediaTekLinkItConnect
	buildEsp8266
	buildMqtt3js
	buildMqttPainter
	buildMqttPaintHistory
	buildSitesuck
	buildAutomax
	buildAutomaxSensors
end

build
