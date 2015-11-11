
/**
 * Object that holds application data and functions.
 */
var app = {};

app.initialize = function() {
	document.addEventListener(
		'deviceready',
		app.onReady,
		false);
}

app.onReady = function() {
	var canvas = document.getElementById("canvas");
	var ctx = canvas.getContext('2d');
	var left, top;
	{
		var totalOffsetX = 0;
		var totalOffsetY = 0;
		var curElement = canvas;

		do{
			totalOffsetX += curElement.offsetLeft;
			totalOffsetY += curElement.offsetTop;
		} while(curElement = curElement.offsetParent)
		left = totalOffsetX;
		top = totalOffsetY;
	}
	console.log(left+" "+top);
	ctx.beginPath();
	canvas.addEventListener("touchmove", function(event) {
		var t = event.touches[0];
		//console.log(Math.floor(t.clientX)+"x"+Math.floor(t.clientY));
		ctx.lineTo(Math.floor(t.clientX) - left, Math.floor(t.clientY) - top);
		ctx.stroke();
	});
}

app.initialize();
