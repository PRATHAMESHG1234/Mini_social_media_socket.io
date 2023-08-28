const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const nextServerPort = process.env.PORT || 3000;
const socketServerPort = 4000;

const createSocketServer = async () => {
	const expressApp = express();
	const server = http.createServer(expressApp);
	const io = socketio(server);

	io.on('connection', (socket) => {
		console.log('User connected');

		// Socket.io event handling code
		// ...

		socket.on('disconnect', () => {
			console.log('User disconnected');
		});
	});

	server.listen(socketServerPort, () => {
		console.log(`Socket.io server listening on port ${socketServerPort}`);
	});
};

const createNextServer = async () => {
	await app.prepare();
	const expressApp = express();

	// Define your API routes or other middleware here, if applicable
	expressApp.use('/api/signup', require('./api/signup'));
	expressApp.use('/api/auth', require('./api/auth'));
	expressApp.use('/api/search', require('./api/search'));
	expressApp.use('/api/posts', require('./api/posts'));
	expressApp.use('/api/profile', require('./api/profile'));
	expressApp.use('/api/notifications', require('./api/notifications'));
	expressApp.use('/api/chats', require('./api/chats'));
	expressApp.all('*', (req, res) => handle(req, res));

	expressApp.listen(nextServerPort, (err) => {
		if (err) {
			throw err;
		}
		console.log(`Next.js server running on port ${nextServerPort}`);
	});
};

async function startServers() {
	try {
		await createSocketServer();
		await createNextServer();
	} catch (error) {
		console.error('Error starting servers:', error);
		process.exit(1);
	}
}

startServers();
