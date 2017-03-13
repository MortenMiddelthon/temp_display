"use strict";
var sleep = require('sleep');
var fs = require('fs');
var content;
var device_dir = "/sys/bus/w1/devices";

var devices = [];

process.title = 'read_temp_server';

// Port where we'll run the websocket server
var webSocketsServerPort = 31338;

// websocket and http servers
var webSocketServer = require('websocket').server;
var http = require('http');

/**
 * Global variables
 */
// latest 100 messages
var history = [ ];
// list of currently connected clients (users)
var clients = [ ];

/**
 * Helper function for escaping input strings
 */
function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;')
                      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/**
 * HTTP server
 */
var server = http.createServer(function(request, response) {
    // Not important for us. We're writing WebSocket server, not HTTP server
});
server.listen(webSocketsServerPort, function() {
    console.log((new Date()) + " Server is listening on port " + webSocketsServerPort);
});

/**
 * WebSocket server
 */
var wsServer = new webSocketServer({
    // WebSocket server is tied to a HTTP server. WebSocket request is just
    // an enhanced HTTP request. For more info http://tools.ietf.org/html/rfc6455#page-6
    httpServer: server
});

// This callback function is called every time someone
// tries to connect to the WebSocket server
wsServer.on('request', function(request) {
    console.log((new Date()) + ' Connection from origin ' + request.origin + '.');

    // accept connection - you should check 'request.origin' to make sure that
    // client is connecting from your website
    // (http://en.wikipedia.org/wiki/Same_origin_policy)
    var connection = request.accept(null, request.origin); 
    // we need to know client index to remove them on 'close' event
    var index = clients.push(connection) - 1;

    console.log((new Date()) + ' Connection accepted.');

    // user disconnected
    connection.on('close', function(connection) {
            console.log((new Date()) + " Peer "
                + connection.remoteAddress + " disconnected.");
            // remove user from the list of connected clients
            clients.splice(index, 1);
    });
});

setInterval(send_temp,2000);

function send_temp() {
	devices = fs.readdirSync(device_dir);

	for(var dev in devices) {
		if(devices[dev].includes("28-")) {
			// console.log("Device: " + devices[dev]);
			content = fs.readFileSync(device_dir+"/"+devices[dev]+"/w1_slave", "utf-8");
			// console.log(content);
			var temp_match = /t=(\d+)/m;
			var temp = content.match(temp_match);
			console.log(devices[dev] + ": " + temp[1]/1000 + "\xB0"+"C");
			var json = JSON.stringify({ type:'message', id: dev, temperature: temp[1]/1000 });
			if(isJSON(json)) {
				for (var i=0; i < clients.length; i++) {
					clients[i].sendUTF(json);
				}
			}
		}
	}
}

function isJSON(str) {
	try {
		JSON.parse(str);
	} catch (e) {
		return false;
	}
	return true;
}
