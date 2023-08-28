const UserModel = require('../models/UserModel');
const NotificationModel = require('../models/NotificationModel');

const setNotificationToUnread = async (userId) => {
	try {
		const user = await UserModel.findById(userId);

		if (!user.unreadNotification) {
			user.unreadNotification = true;
			await user.save();
		}
		return;
	} catch (error) {
		console.error(error);
	}
};

const newLikeNotification = async (userId, postId, userToNotifyId) => {
	try {
		const userToNotify = await NotificationModel.findOne({
			user: userToNotifyId,
		});
		const notification = new NotificationModel({
			user: userId,
			post: postId,
			type: 'newLike',
			date: Date.now(),
		});
		await userToNotify.notifications.unshift(notification);
		userToNotify.save();
		setNotificationToUnread(userId);
		return;
	} catch (error) {
		console.error(error);
	}
};

const removeLikeNotification = async (userId, postId, userToNotifyId) => {
	try {
		await NotificationModel.findOneAndUpdate(
			{ user: userToNotifyId },
			{
				$pull: {
					notifications: {
						type: 'newLike',
						user: userId,
						post: postId,
					},
				},
			},
		);

		return;
	} catch (error) {
		console.error(error);
	}
};

const newCommentNotification = async (
	postId,
	commentId,
	userId,
	userToNotifyId,
	text,
) => {
	try {
		let userToNotify = await NotificationModel.findOne({
			user: userToNotifyId,
		});

		if (!userToNotify) {
			userToNotify = new NotificationModel({
				user: userToNotifyId,
				notifications: [],
			});
		}

		const notification = {
			user: userId,
			post: postId,
			commentId,
			type: 'newComment',
			date: Date.now(),
			text: text,
		};
		userToNotify.notifications.unshift(notification); // Add the new notification to the array
		await userToNotify.save();
		setNotificationToUnread(userToNotifyId);
		return;
	} catch (error) {
		console.error(error);
	}
};

const removeCommentNotification = async (
	userToNotifyId,
	postId,
	commentId,
	userId,
) => {
	try {
		await NotificationModel.findOneAndUpdate(
			{ user: userToNotifyId },
			{
				$pull: {
					notifications: {
						type: 'newComment',
						user: userId,
						post: postId,
						commentId: commentId,
					},
				},
			},
			{ new: true },
		);
	} catch (error) {
		console.error(error);
	}
};

const newFollowerNotification = async (userId, userToNotifyId) => {
	try {
		const userToNotify = await NotificationModel.findOne({
			user: userToNotifyId,
		});
		const notification = new NotificationModel({
			user: userId,
			type: 'newFollower',
			date: Date.now(),
		});
		await userToNotify.notifications.unshift(notification);
		await userToNotify.save();
		setNotificationToUnread(userToNotifyId);
		return;
	} catch (error) {
		console.error(error);
		2;
	}
};

const removeFollowerNotification = async (userId, userToNotifyId) => {
	try {
		await NotificationModel.findOneAndUpdate(
			{ user: userToNotifyId },
			{
				$pull: {
					notifications: {
						type: 'newFollower',
						user: userId,
					},
				},
			},
		);
	} catch (error) {
		console.error(error);
	}
};

module.exports = {
	newLikeNotification,
	removeLikeNotification,
	newCommentNotification,
	removeCommentNotification,
	newFollowerNotification,
	removeFollowerNotification,
};
