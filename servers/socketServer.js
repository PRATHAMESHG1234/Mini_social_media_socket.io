// socketServer.js
const express = require('express');
const http = require('http');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const PORT = 4000;

const createSocketServer = async () => {
	io.on('connection', (socket) => {
		console.log('User connected');

		// Socket.io event handling code
		// ...

		socket.on('disconnect', () => {
			console.log('User disconnected');
		});
	});

	server.listen(PORT, () => {
		console.log(`Socket.io server listening on port ${PORT}`);
	});
};

module.exports = createSocketServer;
