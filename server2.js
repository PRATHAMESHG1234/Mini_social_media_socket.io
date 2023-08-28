const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const createSocketServer = () => {
	// Create the Express app
	const expressApp = express();

	// Create a regular HTTP server using Express
	const server = http.createServer(expressApp);

	// Create a Socket.IO instance and attach it to the server
	const io = new Server(server);

	// Listen for incoming client connections
	io.on('connection', (socket) => {
		console.log('A user connected:', socket.id);

		// Additional logic can be added here to track or store connected users.

		// Handle disconnection of the client
		socket.on('disconnect', () => {
			console.log('A user disconnected:', socket.id);

			// Additional logic can be added here to handle disconnection.
		});
	});

	return server;
};

const port = process.env.PORT || 3000;

app.prepare().then(() => {
	const server = createSocketServer();

	// Use the Express server as a handler in Next.js
	server.listen(port, (err) => {
		if (err) throw err;
		console.log(`> Ready on http://localhost:${port}`);
	});
});
