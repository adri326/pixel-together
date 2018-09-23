"use strict";

let canvas = document.getElementsByTagName("canvas")[0];
let ctx = null;// canvas.getContext("2d");
let params = {
	"default": {
		"offsetColor": [
			10,
			10,
			10,
			.8
		],
		"paperColor": [
			255,
			255,
			255,
			1
		],
		"canvasWidth": "omni",
		"canvasHeight": "omni"
	},
	"paper": {
		"position": "center",
		"relHeight": 32,
		"relWidth": 32,
		"x": 0,
		"y": 0,
		"scale": 16
	},
	"grid": {
		"color": [
			255,
			255,
			255,
			1
		]
	}
};

let data = {
	"cursor": {
		"lastPosition": [
			0,
			0
		],
		"down": false
	},
	"brush": brushes[0],
	"color": [
		0,
		0,
		0,
		1
	],
	"history": [],
	"recoverPosition": 0
}

let imageData = new PixelImage(params.paper.relWidth, params.paper.relHeight);

function initCanvas() {

	switch (params.default.canvasWidth) {
		case "omni":
			canvas.width = innerWidth;
			break;
		case "auto":
			canvas.width = params.paper.relWidth * params.paper.scale;
			break;
		default:
			canvas.width = params.default.canvasWidth;
			break;
	}

	switch (params.default.canvasHeight) {
		case "omni":
			canvas.height = innerHeight;
			break;
		case "auto":
			canvas.height = params.paper.relHeight * params.paper.scale;
			break;
		default:
			canvas.height = params.default.canvasHeight;
			break;
	}

	ctx = canvas.getContext("2d");

	params.paper.x = Math.round((canvas.width - params.paper.relWidth * params.paper.scale) / 2);
	params.paper.y = Math.round((canvas.height - params.paper.relHeight * params.paper.scale) / 2);

	updateCanvas();
}

function toRGBA([r, g, b, a]) {
	return `rgba(${r}, ${g}, ${b}, ${a})`;
}

// Handles the `mousedown` event
function mouseDownHandler(e) {
	data.cursor.lastPosition = [
		e.x - canvas.offsetLeft,
		e.y - canvas.offsetTop
	];
	data.cursor.down = true;

	let x = Math.floor(
		(data.cursor.lastPosition[0] - params.paper.x)
		/ params.paper.scale
	);
	let y = Math.floor(
		(data.cursor.lastPosition[1] - params.paper.y)
		/ params.paper.scale
	);

	/*data.history.push({
		"name": "drawing",
		"brush": data.brush,
		"replacedColors": [
			imageData.getPixel(x, y)
		]
	});*/

	data.replacedColors = data.brush.stroke(x, y);

	updateCanvas();
}

// handles the `mousemove` event
function mouseMovedHandler(e) {
	// only stroke if the mouse is down
	if (data.cursor.down) {
		let position = [
			e.x - canvas.offsetLeft,
			e.y - canvas.offsetTop
		];

		let x = Math.floor(
			(position[0] - params.paper.x)
			/ params.paper.scale
		);
		let y = Math.floor(
			(position[1] - params.paper.y)
			/ params.paper.scale
		);

		// stroke and append replacedColors
		let replacedColors = data.brush.stroke(x, y);
		data.replacedColors = data.replacedColors.concat(replacedColors);

		data.cursor.lastPosition = position;

		updateCanvas();
	}
}

// Handles the `mouseup` event
function mouseUpHandler(e) {
	data.cursor.down = false;
	if (data.replacedColors.length) {
		// TODO: faire une fonction pour push dans l'historique et faire la dynamique d'historique (enlever les trucs à redo)
		data.history.push({
			"name": "drawing",
			"brush": data.brush,
			"replacedColors": data.replacedColors,
			"color": data.color
		});
		data.replacedColors = [];
	}
}
/*
function undoEvent(e) {
	// si on peut undo:
	// défaire l'action à undo
	if (--data.recoverPosition >= 0) {
		let undoAction = data.history[data.recoverPosition];
		if (undoAction.name === "drawing") {
			data.brush = undoAction.brush;
			for (let i = 0; i < undoAction.replacedColors.length; ++i) {
				let x = undoAction.replacedColors[i][0];
				let y = undoAction.replacedColors[i][1];
				let color = undoAction.replacedColors[i].slice(2);
				imageData.setPixel(x, y, color);
			}
		}
	}
}

function redoEvent(e) {
	// si on peut redo:
	// refaire l'action à redo
}

/**/
function undoEvent(e) {
	if (data.history[data.history.length - 1] !== undefined) {
		let undoAction = data.history[data.history.length - 1];
		if (undoAction.name === "drawing") {
			data.brush = undoAction.brush;
			for (let i = 0; i < undoAction.replacedColors.length; ++i) {
				//undoAction.brush.dot(undoAction.replacedColors[i][0], undoAction.replacedColors[i][1], undoAction.replacedColors[i].slice(2));
				imageData.setPixel(undoAction.replacedColors[i][0], undoAction.replacedColors[i][1], undoAction.replacedColors[i].slice(2));
			}
		}
	}
}

function redoEvent(e) {
	if (data.history[data.history.length + 1] !== undefined) {
		let redoAction = data.history[data.history.length + 1];
		data.brush = redoAction.brush;
		for (let i = 0; i < redoAction.replacedColors.length; ++i) {
			redoAction.brush.dot(redoAction.replacedColors[i][0])
		}
	}
}//*/

function contextMenuEvent(e) {
	e.preventDefault();
}

function keyEventHandler(e) {
	switch (true) {
		case e.code === "Digit1":
			selectBrush(0);
			break;
		case e.code === "Digit2":
			selectBrush(1);
			break;
		case e.code === "z" && e.ctrlKey:
			undoEvent(e);
			e.preventDefault();
			break;
		case e.code === "y" && e.ctrlKey:
			redoEvent(e);
			break;
	}
	updateCanvas();
	return false;
}

function resizeEvent() {
	if (params.default.canvasWidth === "omni") {
		canvas.width = innerWidth;
	}
	if (params.default.canvasHeight === "omni") {
		canvas.height = innerHeight;
	}
	params.paper.x = Math.round((canvas.width - params.paper.relWidth * params.paper.scale) / 2);
	params.paper.y = Math.round((canvas.height - params.paper.relHeight * params.paper.scale) / 2);

	updateCanvas();
}

function selectBrush(index) {
	data.brush = brushes[index];
	let oldBrushIndicator = document.querySelector(".toolbox .brushes .current");
	let newBrushIndicator = document.querySelectorAll(".toolbox .brushes > li")[index];
	oldBrushIndicator.classList.remove("current");
	newBrushIndicator.classList.add("current");
}

// Draws the canvas and its stuff
function updateCanvas() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	// <canvas> background
	ctx.fillStyle = toRGBA(params.default.offsetColor);
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	// paper background
	ctx.fillStyle = toRGBA(params.default.paperColor);
	ctx.fillRect(params.paper.x, params.paper.y, params.paper.relWidth * params.paper.scale, params.paper.relHeight * params.paper.scale);

	// draw them piskels
	for (var x = 0; x < params.paper.relWidth; x++) {
		for (var y = 0; y < params.paper.relHeight; y++) {
			ctx.fillStyle = toRGBA(imageData.getPixel(x, y));
			ctx.fillRect(
				params.paper.x + x * params.paper.scale,
				params.paper.y + y * params.paper.scale,
				params.paper.scale,
				params.paper.scale
			);
		}
	}
}

function changeColor(element) {
	let r = parseInt(element.value.slice(1, 3), 16);
	let g = parseInt(element.value.slice(3, 5), 16);
	let b = parseInt(element.value.slice(5, 7), 16);
	data.color[0] = r;
	data.color[1] = g;
	data.color[2] = b;
}

addEventListener("mousedown", mouseDownHandler, false);
addEventListener("mousemove", mouseMovedHandler, false);
addEventListener("mouseup", mouseUpHandler, false);
addEventListener("keydown", keyEventHandler, false);
addEventListener("contextmenu", contextMenuEvent, false);
addEventListener("resize", resizeEvent, false);

// TODO: move to initCanvas
{
	let colorSelector = document.querySelector("input[type=\"color\"]");
	colorSelector.addEventListener("change", () => changeColor(colorSelector));
	let colorHolders = document.querySelectorAll("#colors td");
	colorHolders.forEach((element) => {
		let color = new ColorHolder(element, params.default.paperColor);
		color.update();
	});
}
initCanvas();
