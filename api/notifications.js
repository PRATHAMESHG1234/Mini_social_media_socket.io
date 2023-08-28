const express = require('express');

const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');

const NotificationModel = require('../models/NotificationModel');
const UserModel = require('../models/UserModel');

router.get('/', authMiddleware, async (req, res) => {
	try {
		const { userId } = req;
		const user = await NotificationModel.find({ user: userId })
			.populate('notifications.user')
			.populate('notifications.post');
		console.log('user.notifications:', user[0].user);
		return res.json(user[0].notifications);
	} catch (error) {
		console.error(error);
		return res.status(500).send('Server Error!');
	}
});

router.post('/', authMiddleware, async (req, res) => {
	try {
		const { userId } = req;

		const user = await UserModel.findById(userId).select('-password -__v');
		if (!user) {
			return res.status(404).send('User not found!');
		}
		if (user.unreadNotification) {
			user.unreadNotification = false;
			await user.save();
		}
		return res.status(200).send('Updated');
	} catch (error) {
		console.error(error);
		return res.status(500).send('Server Error!');
	}
});

module.exports = router;
