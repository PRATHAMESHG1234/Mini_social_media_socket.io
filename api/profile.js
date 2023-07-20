const express = require('express');

const router = express.Router();
const bcrypt = require('bcryptjs');
const authMiddleware = require('../middleware/authMiddleware');
const UserModel = require('../models/UserModel');
const ProfileModel = require('../models/ProfileModel');
const FollowerModel = require('../models/FollowerModel');
const PostModel = require('../models/PostModel');
const {
	newFollowerNotification,
	removeFollowerNotification,
} = require('../utilsServer/notificationAction');

//GET PROFILE INFO
router.get('/:username', authMiddleware, async (req, res) => {
	const { username } = req.params;
	try {
		const user = await UserModel.findOne({ username: username.toLowerCase() });
		if (!user) {
			return res.status(404).send('User not found');
		}

		const profile = await ProfileModel.findOne({ user: user._id }).populate(
			'user',
		);
		const profileFollowStats = await FollowerModel.findOne({ user: user._id });
		return res.json({
			profile,
			followersLength:
				profileFollowStats.followers.length > 0
					? profileFollowStats.followers.length
					: 0,
			followingLength:
				profileFollowStats.following.length > 0
					? profileFollowStats.following.length
					: 0,
		});
	} catch (error) {
		console.error(error);
		return res.status(500).send('Server error!');
	}
});

//GET POSTS OF USER
router.get('/posts/:username', authMiddleware, async (req, res) => {
	const { username } = req.params;
	try {
		const user = await UserModel.findOne({ username: username.toLowerCase() });
		if (!user) {
			return res.status(404).send('User not found');
		}

		const posts = await PostModel.find({ user: user._id })
			.sort({ createdAt: -1 })
			.populate('user')
			.populate('comments.user');
		return res.json(posts);
	} catch (error) {
		console.error(error);
		return res.status(500).send('Server error!');
	}
});
// GET FOLLOWERS

router.get('/followers/:userId', authMiddleware, async (req, res) => {
	const { userId } = req.params;

	try {
		const user = await FollowerModel.findOne({ user: userId }).populate(
			'followers.user',
		);
		if (!user) {
			return res.status(404).send('User not found');
		}
		return res.json(user.followers);
	} catch (error) {
		console.error(error);
		return res.status(500).send('Server error!');
	}
});
// GET FOLLOWING

router.get('/following/:userId', authMiddleware, async (req, res) => {
	const { userId } = req.params;

	try {
		const user = await FollowerModel.findOne({ user: userId }).populate(
			'following.user',
		);
		console.log(user);
		if (!user) {
			return res.status(404).send('User not found');
		}

		return res.json(user.following);
	} catch (error) {
		console.error(error);
		return res.status(500).send('Server error!');
	}
});

// FOLLOW A USER
router.post('/follow/:userToFollowId', authMiddleware, async (req, res) => {
	const { userId } = req;
	const { userToFollowId } = req.params;
	try {
		const user = await FollowerModel.findOne({ user: userId });
		const userToFollow = await FollowerModel.findOne({ user: userToFollowId });
		if (!user || !userToFollow) {
			return res.status(404).send('User not found');
		}
		const isFollowing =
			user.following.length > 0 &&
			user.following.filter(
				(following) => following.user.toString() === userToFollowId,
			).length > 0;

		if (isFollowing) {
			return res.status(401).send('User already followed');
		}

		await user.following.unshift({ user: userToFollowId });
		await user.save();
		await userToFollow.followers.unshift({ user: userId });
		await userToFollow.save();

		await newFollowerNotification(userId, userToFollowId);
		return res.status(200).send('Success!');
	} catch (error) {
		console.error(error);
		return res.status(500).send('Server error!');
	}
});
// UNFOLLOW A USER
router.put('/unfollow/:userToUnFollowId', authMiddleware, async (req, res) => {
	const { userId } = req;
	const { userToUnFollowId } = req.params;
	try {
		const user = await FollowerModel.findOne({ user: userId });
		const userToUnFollow = await FollowerModel.findOne({
			user: userToUnFollowId,
		});
		if (!user || !userToUnFollow) {
			return res.status(404).send('User not found');
		}
		const isFollowing =
			user.following.length > 0 &&
			user.following.filter(
				(following) => following.user.toString() === userToUnFollowId,
			).length === 0;

		if (isFollowing) {
			return res.status(401).send('User not followed previously');
		}
		const removeFollowing = user.following
			.map((following) => following.user.toString())
			.indexOf(userToUnFollowId);

		await user.following.splice(removeFollowing, 1);
		await user.save();

		const removeFollower = user.followers
			.map((follower) => follower.user.toString())
			.indexOf(userId);

		await userToUnFollow.followers.splice(removeFollower, 1);
		await userToUnFollow.save();
		await removeFollowerNotification(userId, userToUnFollowId);
		return res.status(200).send('Success!');
	} catch (error) {
		console.error(error);
		return res.status(500).send('Server error!');
	}
});

//  UPDATE PROFILE
router.post('/update', authMiddleware, async (req, res) => {
	try {
		const { userId } = req;
		console.log(req.body);
		const { bio, facebook, youtube, twitter, instagram, profilePicUrl } =
			req.body;
		let profilFields = {};
		profilFields.user = userId;
		profilFields.bio = bio;
		profilFields.social = {};

		if (facebook) {
			profilFields.social.facebook = facebook;
		}
		if (twitter) {
			profilFields.social.twitter = twitter;
		}
		if (youtube) {
			profilFields.social.youtube = youtube;
		}
		if (instagram) {
			profilFields.social.instagram = instagram;
		}

		await ProfileModel.findOneAndUpdate(
			{ user: userId },
			{ $set: profilFields },
			{ new: true },
		);

		if (profilePicUrl) {
			const user = await UserModel.findById(userId);
			user.profilePicUrl = profilePicUrl;
			await user.save();
		}
		return res.status(200).send('Success!');
	} catch (error) {
		console.error(error);
		return res.status(500).send('Server error!');
	}
});

//UPDATE PASSWORD
router.post('/settings/password', authMiddleware, async (req, res) => {
	try {
		const { currentPassword, newPassword } = req.body;
		const { userId } = req;
		if (newPassword.length < 6) {
			return res.status(401).send('Password atleast must be 6 characters!');
		}
		const user = await UserModel.findById(userId).select('password');
		const isPassword = await bcrypt.compare(currentPassword, user.password);
		if (!isPassword) {
			return res.status(401).send('Invalied Password!');
		}

		user.password = await bcrypt.hash(newPassword, 10);
		await user.save();
		return res.status(200).send('Updated!');
	} catch (error) {
		console.error(error);
		return res.status(500).send('Server error!');
	}
});

// UPDATE MESSAGE POP-UP SETTINGS
router.post('/settings/messagePopup', authMiddleware, async (req, res) => {
	try {
		const { userId } = req;
		const user = await UserModel.findById(userId);
		if (user.newMessagePopUp) {
			user.newMessagePopUp = false;
			await user.save();
		} else {
			user.newMessagePopUp = true;
			await user.save();
		}

		return res.status(200).send('Success!');
	} catch (error) {
		console.error(error);
		return res.status(500).send('Server error!');
	}
});
module.exports = router;
