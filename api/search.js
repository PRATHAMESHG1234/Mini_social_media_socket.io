const authMiddleware = require('../middleware/authMiddleware');
const UserModel = require('../models/UserModel');
const express = require('express');

const router = express.Router();

router.get('/:searchText', authMiddleware, async (req, res) => {
	const { searchText } = req.params;
	const { userId } = req;
	if (searchText.length === 0) {
		return;
	}

	try {
		const results = await UserModel.find({
			name: { $regex: searchText, $options: 'i' },
		});
		const resultsToBeSent =
			results.length > 0 &&
			results.filter((result) => result._id.toString() !== userId);
		res.json(resultsToBeSent);
	} catch (error) {
		console.error(error);
		return res.status(500).send('server error!');
	}
});
module.exports = router;
