const users = [];

const addUser = async (userId, socketId) => {
	const userIndex = users.findIndex((user) => user.userId === userId);

	if (userIndex !== -1) {
		// User with the same userId found
		const user = users[userIndex];
		if (user.socketId === socketId) {
			console.log('if call');
			return users;
		} else {
			console.log('if1 call');
			await removeUser(user.socketId);
		}
	}
	console.log('else2 call');
	const newUser = {
		userId,
		socketId,
	};
	users.push(newUser);
	console.log(users);

	return users;
};

const removeUser = async (socketId) => {
	const userIndex = users.findIndex((user) => user.socketId === socketId);
	if (userIndex !== -1) {
		users.splice(userIndex, 1);
	}
	return users;
};

const findConnectedUser = (userId) => {
	return users.find((user) => user.userId === userId);
};

module.exports = {
	addUser,
	removeUser,
	findConnectedUser,
};
