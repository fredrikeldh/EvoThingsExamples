
/**
 * Object that holds application data and functions.
 */
var app = {};

app.connected = false;
app.sending = false;
app.recieveing = true;
app.ready = false;

app.initialize = function() {
	document.addEventListener(
		'deviceready',
		app.onReady,
		false);
	if(!window.cordova) {
		app.onReady();
	}
}

app.onReady = function() {
	if(!app.ready) {
		app.ready = true;
		app.setupCanvas();
		app.setupConnection();
	}
}

app.setupCanvas = function() {
	app.canvas = document.getElementById("canvas");
	app.ctx = app.canvas.getContext('2d');
	app.ctx.beginPath();
}

// progress on transfers from the server to the client (downloads)
function updateProgress (oEvent) {
  if (oEvent.lengthComputable) {
    var percentComplete = oEvent.loaded / oEvent.total;
    // ...
  } else {
    // Unable to compute progress information since the total size is unknown
  }
}

function transferComplete(evt) {
  console.log("The transfer is complete.");
}
function transferFailed(evt) {
  console.log("An error occurred while transferring the file."+JSON.stringify(evt));
}
function transferCanceled(evt) {
  console.log("The transfer has been canceled by the user.");
}
function reqListener () {
	console.log(this.responseText);
}

app.setupConnection = function() {
	var username = 'a-qd1kqs-2smp6qkafb';
	var password = '6XX6(mnzbUeW9THEkW';

	/*var oReq = new XMLHttpRequest();
	oReq.addEventListener("load", reqListener);
	oReq.addEventListener("progress", updateProgress);
	oReq.addEventListener("load", transferComplete);
	oReq.addEventListener("error", transferFailed);
	oReq.addEventListener("abort", transferCanceled);
	//oReq.withCredentials = true;
	oReq.open("GET", "https://internetofthings.ibmcloud.com/api/v0001/historian/qd1kqs/phone/1", true);//, username, password);
	//oReq.setRequestHeader( 'Authorization', 'Basic ' + btoa( username + ':' + password ) )
	oReq.send();*/

	cordovaHTTP.useBasicAuth(username, password, function() {
		console.log('useBasicAuth success!');
	}, function() {
		console.log('useBasicAuth error :(');
	});
	cordovaHTTP.get("https://internetofthings.ibmcloud.com/api/v0001/historian/qd1kqs/phone/1", {}, {}, function(response) {
		//console.log(JSON.stringify(response));
		app.status("HTTP success "+response.status);
		app.onMessageArrived(response.data);
	}, function(response) {
		console.log(JSON.stringify(response));
	});
	app.status("Connecting...");
}

var topic = 'iot-2/type/phone/id/1/evt/paint/fmt/json';
app.publish = function(message) {
	//var topic = '/test';
	var qos = 1;
	//console.log('Publishing Message: Topic: \''+topic+'\'. QoS: ' + qos + '. Message: '+message);
	message = new Paho.MQTT.Message(message);
	message.destinationName = topic;
	message.qos = qos;
	app.mqttClient.send(message);
};

app.subscribe = function() {
	app.mqttClient.subscribe(topic);
}

app.unsubscribe = function() {
	app.mqttClient.unsubscribe(topic);
}

app.onMessageArrived = function(message) {
  //console.log("onMessageArrived:"+message.payloadString);
	var array = JSON.parse(message);
	for(var i=0; i<array.length; i++) {
		var event = array[i].evt;
		app.ctx.lineTo(event.x, event.y);
	}
	app.ctx.stroke();
}

app.status = function(s) {
	console.log(s);
	var info = document.getElementById("info");
	info.innerHTML = s;
}

app.initialize();
