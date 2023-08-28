const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const app = express();

const next = require('next');
const cors = require('cors');
const httpProxy = require('http-proxy');
const connectDb = require('./utilsServer/connectDb');
const {
	addUser,
	removeUser,
	findConnectedUser,
} = require('./utilsServer/roomActions');
const {
	loadMessages,
	sendMessages,
	setMessageToUnread,
	deleteMessage,
} = require('./utilsServer/messageActions');
const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();
const proxy = httpProxy.createProxyServer();
const PORT = process.env.PORT || 3000;

nextApp.prepare().then(async () => {
	const app = express();
	app.use(cors());
	app.use(express.json()); // Body parser
	// Define your API routes or other middleware here, if applicable
	app.use('/api/signup', require('./api/signup'));
	app.use('/api/auth', require('./api/auth'));
	app.use('/api/search', require('./api/search'));
	app.use('/api/posts', require('./api/posts'));
	app.use('/api/profile', require('./api/profile'));
	app.use('/api/notifications', require('./api/notifications'));
	app.use('/api/chats', require('./api/chats'));
	app.all('*', (req, res) => {
		// Use the proxy for the '/socket.io' path to route to the socket.io server
		if (req.path.startsWith('/socket.io')) {
			proxy.web(req, res, { target: `http://localhost:${PORT}` });
		} else {
			handle(req, res);
		}
	});

	connectDb();

	app.listen(PORT, (err) => {
		if (err) {
			throw err;
		}
		console.log(`Express server running on ${PORT}`);
	});
});

const server = http.createServer(); // Use 'app' to create the server
const io = socketio(server);

io.on('connection', (socket) => {
	socket.on('join', async ({ userId }) => {
		try {
			const users = await addUser(userId, socket.id);

			// Emit the initial list of connected users (excluding the current user)
			socket.emit('connectedUsers', {
				users: users && users.filter((user) => user.userId !== userId),
			});

			// Emit the list of connected users every 10 seconds
			const interval = setInterval(() => {
				socket.emit('connectedUsers', {
					users: users && users.filter((user) => user.userId !== userId),
				});
			}, 10000);

			// Optionally, you can store the interval ID in the socket object
			socket.interval = interval;
		} catch (error) {
			console.error(error);
		}
	});

	socket.on(
		'sendNewMessage',
		async ({ userId, messageSendToUserId, message }) => {
			try {
				const { newMessage, error } = await sendMessages(
					userId,
					messageSendToUserId,
					message,
				);
				const receiverSocket = findConnectedUser(messageSendToUserId);
				if (receiverSocket) {
					// WHEN YOU WANT SEND MSG TO PARTICULAR USER
					io.to(receiverSocket.socketId).emit('newMessageReceived', {
						newMessage,
					});
				} else {
					await setMessageToUnread(messageSendToUserId);
				}
				if (!error) {
					socket.emit('messageSent', { newMessage });
				}
			} catch (error) {
				console.error(error);
			}
		},
	);
	socket.on('loadMessages', async ({ userId, messagesWith }) => {
		try {
			const { chat, error } = await loadMessages(userId, messagesWith);
			if (!error) {
				socket.emit('messagesLoaded', { chat });
			} else {
				socket.emit('noChatFound');
			}
		} catch (error) {
			console.error(error);
		}
	});

	socket.on('deleteMessage', ({ userId, messagesWith, messageId }) => {
		const { success } = deleteMessage(userId, messagesWith, messageId);
		if (success) {
			socket.emit('messageDeleted');
		}
	});

	socket.on(
		'sendMsgFromNotification',
		async ({ userId, messageSendToUserId, message }) => {
			const { newMessage, error } = await sendMessages(
				userId,
				messageSendToUserId,
				message,
			);
			const receiverSocket = findConnectedUser(messageSendToUserId);
			if (receiverSocket) {
				// WHEN YOU WANT SEND MSG TO PARTICULAR USER
				io.to(receiverSocket.socketId).emit('newMessageReceived', {
					newMessage,
				});
			} else {
				await setMessageToUnread(messageSendToUserId);
			}
			!error && socket.emit('msgSentFromNotification');
		},
	);
	socket.on('disconnect', () => {
		console.log('A user disconnected');
		removeUser(socket.id);
	});
});
server.listen(4000, () => {
	console.log(`Socket.io server listening on port ${PORT}`);
});
