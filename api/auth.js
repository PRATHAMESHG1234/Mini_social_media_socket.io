const express = require('express');

const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const isEmail = require('validator/lib/isEmail');
const UserModel = require('../models/UserModel');
const FollowerModel = require('../models/FollowerModel');
const NotificationModel = require('../models/NotificationModel');
const ChatModel = require('../models/ChatModel');

const authMiddleware = require('../middleware/authMiddleware');
const regexusername = /^(?!.*\.\.)(?!.*\.$)[^\W][\w.]{0,29}$/;
router.get('/', authMiddleware, async (req, res) => {
	const { userId } = req;
	try {
		const user = await UserModel.findById(userId);

		const userFollowStats = await FollowerModel.findOne({ user: userId });
		return res.status(200).json({ user, userFollowStats });
	} catch (error) {
		console.error(error);
		return res.status(500).send('server error!');
	}
});
router.post('/', async (req, res) => {
	const { email, password } = req.body.user;

	if (!isEmail(email)) {
		return res.status(401).send('Invalid Email');
	}
	if (password.length < 6) {
		return res.status(401).send('Password must be at least 6 characters');
	}
	try {
		const user = await UserModel.findOne({ email: email.toLowerCase() }).select(
			'+password',
		);

		if (!user) {
			return res.status(401).send('Invalid credentials');
		}

		const isPassword = await bcrypt.compare(password, user.password);
		if (!isPassword) {
			return res.status(401).send('Invalid credentials');
		}
		const notificationModel = await NotificationModel.findOne({
			user: user._id,
		});
		if (!notificationModel) {
			const newNotificationModel = new NotificationModel({
				user: user._id,
				notifications: [],
			});
			await newNotificationModel.save();
		}
		const chatModel = await ChatModel.findOne({
			user: user._id,
		});
		if (!chatModel) {
			const newChatModel = new ChatModel({
				user: user._id,
				chats: [],
			});
			await newChatModel.save();
		}

		const payload = { userId: user._id };
		jwt.sign(
			payload,
			process.env.jwtSecret,
			{ expiresIn: '2d' },
			(err, token) => {
				if (err) {
					throw err;
				}
				res.status(200).json(token);
			},
		);
	} catch (error) {
		console.error(error);
		return res.status(500).send('server error!');
	}
});
module.exports = router;
