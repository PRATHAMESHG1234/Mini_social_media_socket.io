// nextApp.js
const next = require('next');
const express = require('express');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const PORT = process.env.PORT || 3000;

const createNextServer = async () => {
	await app.prepare();
	const expressApp = express();

	// Define your API routes or other middleware here, if applicable
	expressApp.use('/api/signup', require('../api/signup'));
	expressApp.use('/api/auth', require('./api/auth'));
	expressApp.use('/api/search', require('./api/search'));
	expressApp.use('/api/posts', require('./api/posts'));
	expressApp.use('/api/profile', require('./api/profile'));
	expressApp.use('/api/notifications', require('./api/notifications'));
	expressApp.use('/api/chats', require('./api/chats'));
	expressApp.all('*', (req, res) => handle(req, res));
	// ...

	expressApp.listen(PORT, (err) => {
		if (err) {
			throw err;
		}
		console.log(`Express server running on ${PORT}`);
	});
};

module.exports = createNextServer;
