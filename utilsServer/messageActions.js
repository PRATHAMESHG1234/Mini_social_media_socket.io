const ChatModel = require('../models/ChatModel');
const UserModel = require('../models/UserModel');

const loadMessages = async (userId, messagesWith) => {
	try {
		const user = await ChatModel.findOne({ user: userId }).populate(
			'chats.messagesWith',
		);
		const chat = user.chats.find(
			(chat) => chat.messagesWith._id.toString() === messagesWith,
		);
		if (!chat) {
			return { error: 'Chat not found' };
		}
		return { chat };
	} catch (error) {
		console.log(error);
		return { error };
	}
};

const sendMessages = async (userId, messageSendToUserId, message) => {
	try {
		const user = await ChatModel.findOne({ user: userId });
		const messageSendToUser = await ChatModel.findOne({
			user: messageSendToUserId,
		});
		const newMessage = {
			sender: userId,
			receiver: messageSendToUserId,
			msg: message,
			date: Date.now(),
		};

		const previousChat = user.chats.find(
			(chat) => chat.messagesWith.toString() === messageSendToUserId,
		);
		if (previousChat) {
			previousChat.messages.push(newMessage);
			await user.save();
		} else {
			const newChat = {
				messages: [newMessage],
				messagesWith: messageSendToUserId,
			};
			user.chats.unshift(newChat);
			await user.save();
		}

		// For receiver

		const previousChatForReceiver = messageSendToUser.chats.find(
			(chat) => chat.messagesWith.toString() === userId,
		);
		if (previousChatForReceiver) {
			previousChatForReceiver.messages.push(newMessage);
			await messageSendToUser.save();
		} else {
			const newChat = {
				messages: [newMessage],
				messagesWith: userId,
			};
			messageSendToUser.chats.unshift(newChat);
			await messageSendToUser.save();
		}
		return { newMessage };
	} catch (error) {
		console.log(error);
		return { error };
	}
};

const setMessageToUnread = async (userId) => {
	try {
		const user = await UserModel.findById(userId);
		if (!user.unreadMessage) {
			user.unreadMessage = true;
			await user.save();
		}
		return;
	} catch (error) {
		console.log(error);
		return { error };
	}
};

const deleteMessage = async (userId, messagesWith, messageId) => {
	try {
		const user = await ChatModel.findOne({ user: userId });
		const chat = user.chats.find(
			(chat) => chat.messagesWith.toString() === messagesWith,
		);
		if (!chat) {
			return { error: 'Chat not found' };
		}
		const messageToDelete = chat.messages.find(
			(message) => message._id.toString() === messageId,
		);
		if (!messageToDelete) {
			return { error: 'Message not found' };
		}
		if (messageToDelete.sender.toString() !== userId) {
			return { error: 'You are not the sender of this message' };
		}
		const index = chat.messages
			.map((message) => message._id.toString())
			.indexOf(messageToDelete);
		await chat.messages.splice(index, 1);
		await user.save();
		return { success: true };
	} catch (error) {
		console.log(error);
	}
};

module.exports = {
	loadMessages,
	sendMessages,
	setMessageToUnread,
	deleteMessage,
};
