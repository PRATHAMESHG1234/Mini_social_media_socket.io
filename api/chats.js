const express = require('express');

const router = express.Router();
const ChatModel = require('../models/ChatModel');
const UserModel = require('../models/UserModel');

const authMiddleware = require('../middleware/authMiddleware');
//	GET ALL CHATS
router.get('/', authMiddleware, async (req, res) => {
	try {
		const { userId } = req;
		const user = await ChatModel.findOne({ user: userId }).populate(
			'chats.messagesWith',
		);
		let chatToBeSent = [];
		if (user.chats.length > 0) {
			chatToBeSent = user.chats.map((chat) => ({
				messagesWith: chat.messagesWith._id,
				name: chat.messagesWith.name,
				profilePicUrl: chat.messagesWith.profilePicUrl,
				lastMessage: chat.messages[chat.messages.length - 1].msg,
				date: chat.messages[chat.messages.length - 1].date,
			}));
		}
		return res.status(200).json(chatToBeSent);
	} catch (error) {
		console.error(error);
		return res.status(500).send('Server Error!');
	}
});

//	GET user BY ID

router.get('/user/:userToFindId', authMiddleware, async (req, res) => {
	try {
		const { userToFindId } = req.params;
		const user = await UserModel.findOne({ _id: userToFindId });
		if (!user) {
			return res.status(404).send('User not found!');
		}
		return res
			.status(200)
			.json({ name: user.name, profilePicUrl: user.profilePicUrl });
	} catch (error) {
		console.error(error);
		return res.status(500).send('Server Error!');
	}
});

// DELETE A CHATS

router.delete('/:messagesWith', authMiddleware, async (req, res) => {
	try {
		const { userId } = req;
		const { messagesWith } = req.params;
		const user = await ChatModel.findOne({ user: userId });

		if (!user) {
			return res.status(404).send('User not found!');
		}
		const chatToDelete = user.chats.find(
			(chat) => chat.messagesWith.toString() === messagesWith,
		);
		if (!chatToDelete) {
			return res.status(404).send('Chat not found!');
		}
		const indexOf = user.chats
			.map((chat) => chat.messagesWith.toString())
			.indexOf(messagesWith);
		user.chats.splice(indexOf, 1);
		await user.save();
		return res.status(200).send('Chat deleted!');
	} catch (error) {
		console.error(error);
		return res.status(500).send('Server Error!');
	}
});

module.exports = router;
