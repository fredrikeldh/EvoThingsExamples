
/**
 * Object that holds application data and functions.
 */
var app = {};

app.connected = false;
app.sending = false;
app.recieveing = true;

app.initialize = function() {
	document.addEventListener(
		'deviceready',
		app.onReady,
		false);
}

app.onReady = function() {
	app.setupCanvas();
	app.setupConnection();
}

app.setupCanvas = function() {
	app.canvas = document.getElementById("canvas");
	app.ctx = app.canvas.getContext('2d');
	var left, top;
	{
		var totalOffsetX = 0;
		var totalOffsetY = 0;
		var curElement = canvas;

		do{
			totalOffsetX += curElement.offsetLeft;
			totalOffsetY += curElement.offsetTop;
		} while(curElement = curElement.offsetParent)
		app.left = totalOffsetX;
		app.top = totalOffsetY;
	}
	console.log(app.left+"x"+app.top);
	app.ctx.beginPath();
	canvas.addEventListener("touchmove", function(event) {
		var t = event.touches[0];
		var x = Math.floor(t.clientX) - app.left;
		var y = Math.floor(t.clientY) - app.top;
		app.ctx.lineTo(x, y);
		app.ctx.stroke();
		if(app.connected && app.sending) {
			var msg = JSON.stringify({x:x,y:y})
			app.publish(msg);
			//console.log(msg);
		}
	});
}

app.setupConnection = function() {
	var hostname = 'backup.evothings.com';
	//var hostname = '192.168.1.100';
	var port = 1883;
	var clientId = 'painter_'+Math.floor(Math.random()*100);
	app.mqttClient = new Paho.MQTT.Client(hostname, port, clientId);
  app.status("Connecting...");
	//app.mqttClient.onConnectionLost = app.onConnectionLost;	// todo
	app.mqttClient.onMessageArrived = app.onMessageArrived;
	app.mqttClient.connect({onSuccess:app.onConnect,
		invocationContext: {host : hostname, port: port, clientId: clientId}
	});
}

app.publish = function(message) {
	var topic = '/test';
	var qos = 1;
	//console.log('Publishing Message: Topic: \''+topic+'\'. QoS: ' + qos + '. Message: '+message);
	message = new Paho.MQTT.Message(message);
	message.destinationName = topic;
	message.qos = qos;
	app.mqttClient.send(message);
};

app.subscribe = function() {
	app.mqttClient.subscribe('/test');
}

app.unsubscribe = function() {
	app.mqttClient.unsubscribe('/test');
}

app.onMessageArrived = function(message) {
  //console.log("onMessageArrived:"+message.payloadString);
	var o = JSON.parse(message.payloadString);
	app.ctx.lineTo(o.x, o.y);
	app.ctx.stroke();
}

app.onConnect = function(context) {
	app.status("Connected!");
	app.connected = true;
	if(app.recieveing)
		app.subscribe();
}

app.onSend = function() {
	if(app.connected) {
		app.status("Sending...");
		app.sending = true;
		app.recieveing = false;
		app.unsubscribe();
	}
}

app.onRecieve = function() {
	if(app.connected) {
		app.status("Recieveing...");
		app.recieveing = true;
		app.sending = false;
		app.subscribe();
	}
}

app.status = function(s) {
	console.log(s);
	var info = document.getElementById("info");
	info.innerHTML = s;
}

app.initialize();
