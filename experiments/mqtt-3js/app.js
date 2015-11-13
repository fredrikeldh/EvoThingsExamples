
/**
 * Object that holds application data and functions.
 */
var app = {};

app.connected = false;
app.sending = false;
app.recieveing = true;
app.ax = app.ay = app.az = 0;

app.initialize = function() {
	document.addEventListener(
		'deviceready',
		app.onReady,
		false);
}

app.onReady = function() {
	app.setupCanvas();
	app.setupAccelerometer();
	//app.setupConnection();
}

var scene, camera, renderer;
var geometry, material, mesh;

function init() {
	scene = new THREE.Scene();

	camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
	camera.position.z = 1000;

	geometry = new THREE.BoxGeometry( 200, 200, 200 );
	material = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true } );

	mesh = new THREE.Mesh( geometry, material );
	scene.add( mesh );

	renderer = new THREE.WebGLRenderer();

	var container = document.getElementById("canvas-container");

	// 20 pixel margin
	renderer.setSize( window.innerWidth - (container.offsetLeft + 20), window.innerHeight - (container.offsetTop + 20) );

	container.appendChild( renderer.domElement );
}

function animate() {
	requestAnimationFrame( animate );

	if(true) {
	var g = Math.sqrt(app.ax * app.ax + app.ay * app.ay + app.az * app.az);

	mesh.rotation.x = Math.atan2(app.ay, app.az);
	mesh.rotation.y = Math.asin(app.ax / g);
	mesh.rotation.z = 0;

	//console.log("ax: "+app.ax+" ay: "+app.ay+" az: "+app.az);
	//console.log("g: "+g+" x: "+mesh.rotation.x+" y: "+mesh.rotation.y+" ax/-g: "+app.ax / -g);
	} else {
	mesh.position.x = app.ax*20;
	mesh.position.y = app.ay*20;
	mesh.position.z = app.az*20;
	}

	renderer.render( scene, camera );
}

app.setupCanvas = function() {
	init();
	animate();
	screen.lou = screen.lockOrientation || screen.mozLockOrientation || screen.msLockOrientation;
	if(screen.lou) {
		if(screen.lou.lock)
			screen.lou.lock();
		if(screen.lou.lockOrientation)
			screen.lou.lockOrientation("portrait-primary");
	} else {
		console.log("warn: could not lock orientation.");
	}
}

app.setupAccelerometer = function() {
	window.ondevicemotion = function(event) {
		app.ax = parseFloat(event.accelerationIncludingGravity.x || 0);
		app.ay = parseFloat(event.accelerationIncludingGravity.y || 0);
		app.az = parseFloat(event.accelerationIncludingGravity.z || 0);
	}
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
}

app.onConnect = function(context) {
	app.status("Connected!");
	app.connected = true;
	if(app.recieveing) {
		app.status("Recieveing...");
		app.subscribe();
	}
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
