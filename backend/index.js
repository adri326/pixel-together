"use strict";
// backend main file
const WebSocketServer = require("websocket").server;
const http = require("http");

const Express = require("express");
const ExpressStatic = require("express-static");

var serverA = http.createServer((req, res) => {
	console.log("Request for " + req.url);
	res.writeHead(404);
	res.end();
});

var wss = new WebSocketServer({
	httpServer: serverA,
	autoAcceptConnections: false
});

function allowedOrigin(origin) {
	// no idea what this thing is supposed to filter
	return true;
}

wss.on("request", (req) => {
	if (!allowedOrigin(req.origin)) {
		req.reject();
		return;
	}
	let connection = req.accept("echo-protocol", req.origin);
	connection.on("message", (message) => { // message from the client
		if (message.type === "utf8") {
			console.log(message.utf8Data);
		}
	});
});

const app = Express();
app.use(ExpressStatic(__dirname + "/../frontend/src/"));
const serverB = app.listen(8001, () => {
	console.log("Static server running on port 8001");
});

serverA.listen(8002);
