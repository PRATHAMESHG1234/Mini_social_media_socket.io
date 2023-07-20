const authMiddleware = require('../middleware/authMiddleware');
const UserModel = require('../models/UserModel');
const PostModel = require('../models/PostModel');
const FollowerModel = require('../models/FollowerModel');
const express = require('express');
const {
	newLikeNotification,
	removeLikeNotification,
	newCommentNotification,
	removeCommentNotification,
} = require('../utilsServer/notificationAction');
const uuid = require('uuid').v4;
const router = express.Router();
// Create A post

router.post('/', authMiddleware, async (req, res) => {
	const { text, location, picUrl } = req.body;
	if (text.length < 1) {
		return res.status(401).send('text should be atleast 1 character ');
	}

	try {
		const newPost = {
			user: req.userId,
			text: text,
		};
		if (location) {
			newPost.location = location;
		}
		if (picUrl) {
			newPost.picUrl = picUrl;
		}
		const post = await PostModel(newPost).save();
		res.json(post._id);
	} catch (error) {
		console.error(error);
		return res.status(500).send('server error!');
	}
});
//get posts
router.get('/', authMiddleware, async (req, res) => {
	try {
		const { pageNumber } = req.query;

		const number = Number(pageNumber);
		const size = 8;
		const { userId } = req;

		const looggedUser = await FollowerModel.findOne({ user: userId }).select(
			'-followers',
		);

		let posts = [];

		if (number === 1) {
			if (looggedUser.following.length > 0) {
				posts = await PostModel.find({
					user: {
						$in: [
							userId,
							...looggedUser.following.map((following) => following.user),
						],
					},
				})
					.limit(size)
					.sort({ createdAt: -1 })
					.populate('user')
					.populate('comments.user');
			} else {
				posts = await PostModel.find({ user: userId })
					.limit(size)
					.sort({ createdAt: -1 })
					.populate('user')
					.populate('comments.user');
			}
		} else {
			const skips = size * (number - 1);
			if (looggedUser.following.length > 0) {
				posts = await PostModel.find({
					user: {
						$in: [
							userId,
							...looggedUser.following.map((following) => following.user),
						],
					},
				})
					.skip(skips)
					.limit(size)
					.sort({ createdAt: -1 })
					.populate('user')
					.populate('comments.user');
			} else {
				posts = await PostModel.find({ user: userId })
					.skip(skips)
					.limit(size)
					.sort({ createdAt: -1 })
					.populate('user')
					.populate('comments.user');
			}
		}

		return res.json(posts);
	} catch (error) {
		console.error(error);
		return res.status(500).send('Server error!');
	}
});
// get post by id

router.get('/:postId', authMiddleware, async (req, res) => {
	try {
		const post = await PostModel.findById(req.params.postId);

		if (!post) {
			return res.status(404).send('Post not found');
		}
		return res.json(post);
	} catch (error) {
		console.error(error);
		return res.status(500).send('Server error!');
	}
});

//delete post

router.delete('/:postId', authMiddleware, async (req, res) => {
	try {
		const { userId } = req;
		const { postId } = req.params;

		const post = await PostModel.findById(postId);
		if (!post) {
			return res.status(404).send('Post not found');
		}
		const user = await UserModel.findById(userId);
		if (post.user.toString() !== userId) {
			if (user.role === 'root') {
				await PostModel.deleteOne({ _id: postId });
				return res.status(200).send('Post deleted successfully');
			} else {
				return res.status(401).send('You are unauthorized to delete this post');
			}
		}
		await PostModel.deleteOne({ _id: postId });
		return res.status(200).send('Post deleted successfully');
	} catch (error) {
		console.error(error);
		return res.status(500).send('Server error!');
	}
});

// Like a post
router.post('/like/:postId', authMiddleware, async (req, res) => {
	try {
		const { userId } = req;
		const { postId } = req.params;
		const post = await PostModel.findById(postId);
		if (!post) {
			return res.status(404).send('Post not found');
		}
		const isLiked =
			post.likes.filter((like) => like.user.toString() === userId).length > 0;

		if (isLiked) {
			return res.status(401).send('Post already liked');
		}
		await post.likes.unshift({ user: userId });
		await post.save();
		if (post.user.toString() !== userId) {
			await newLikeNotification(userId, postId, post.user.toString());
		}

		return res.status(200).send('Post liked');
	} catch (error) {
		console.error(error);
		return res.status(500).send('Server error!');
	}
});
// unLike a post
router.put('/unlike/:postId', authMiddleware, async (req, res) => {
	try {
		const { userId } = req;
		const { postId } = req.params;
		const post = await PostModel.findById(postId);
		if (!post) {
			return res.status(404).send('Post not found');
		}
		const isLiked =
			post.likes.filter((like) => like.user.toString() === userId).length === 0;

		if (isLiked) {
			return res.status(401).send('Post not liked before');
		}

		const index = post.likes
			.map((like) => like.user.toString())
			.indexOf(userId);

		await post.likes.splice(index, 1);
		await post.save();
		if (post.user.toString() !== userId) {
			await removeLikeNotification(userId, postId, post.user.toString());
		}
		return res.status(200).send('Post unliked');
	} catch (error) {
		console.error(error);
		return res.status(500).send('Server error!');
	}
});

//get all likes
router.get('/like/:postId', authMiddleware, async (req, res) => {
	try {
		const { postId } = req.params;
		const post = await PostModel.findById(postId).populate('likes.user');
		if (!post) {
			return res.status(404).send('Post not found');
		}
		return res.status(200).json(post.likes);
	} catch (error) {
		console.error(error);
		return res.status(500).send('Server error!');
	}
});

// comment on a post
router.post('/comment/:postId', authMiddleware, async (req, res) => {
	try {
		const { userId } = req;
		const { text } = req.body;
		console.log(text);
		if (text.length < 1) {
			return res.status(401).send('comment atleast 1 character');
		}
		const { postId } = req.params;
		const post = await PostModel.findById(postId);
		if (!post) {
			return res.status(404).send('Post not found');
		}

		const newComment = await post.comments.create({
			_id: uuid(),
			text: text,
			user: userId,
			date: Date.now(),
		});

		post.comments.push(newComment);

		await post.save();
		if (post.user.toString() !== userId) {
			await newCommentNotification(
				postId,
				newComment._id,
				userId,
				post.user.toString(),
				text,
			);
		}

		return res.status(200).send('comment added');
	} catch (error) {
		console.error(error);
		return res.status(500).send('Server error!');
	}
});

//delete comment

router.delete('/:postId/:commentId', authMiddleware, async (req, res) => {
	try {
		const { userId } = req;
		const { postId, commentId } = req.params;

		const post = await PostModel.findById(postId);
		if (!post) {
			return res.status(404).send('Post not found');
		}
		const comment = post.comments.find((comment) => comment._id === commentId);
		if (!comment) {
			return res.status(404).send('comment not found');
		}
		const user = await UserModel.findById(userId);

		const deleteComment = async () => {
			const index = post.comments
				.map((comment) => comment.user.toString())
				.indexOf(commentId);
			await post.comments.splice(index, 1);
			await post.save();
			if (post.user.toString() !== userId) {
				await removeCommentNotification(
					postId,
					commentId,
					userId,
					post.user.toString(),
				);
			}
			return res.status(200).send('Comment deleted successfully');
		};
		if (comment.user.toString() !== userId) {
			if (user.role === 'root') {
				await deleteComment();
			} else {
				return res.status(401).send('You are unauthorized to delete this post');
			}
		}
		await deleteComment();
	} catch (error) {
		console.error(error);
		return res.status(500).send('Server error!');
	}
});
module.exports = router;
