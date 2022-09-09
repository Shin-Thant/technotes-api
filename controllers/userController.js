const User = require("../models/User");
const Note = require("../models/Note");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");

const getAllUsers = async (req, res) => {
	const users = await User.find().select("-password").lean();

	if (!users?.length)
		return res.status(400).json({ message: "No users found!" });

	res.json(users);
};

const createNewUser = async (req, res) => {
	const { username, password, roles } = req.body;

	// confirm data
	if (!username || !password)
		return res.status(400).json({ message: "All fields are required!" });

	// check for duplicates
	const duplicates = await User.findOne({ username })
		.collation({
			locale: "en",
			strength: 2,
		})
		.lean()
		.exec();
	if (duplicates)
		return res.status(409).json({ message: "Duplicate username!" });

	// hash password
	const hashedPwd = await bcrypt.hash(password, 10);

	const userObj =
		!Array.isArray(roles) || !roles.length
			? { username, password: hashedPwd }
			: { username, password: hashedPwd, roles };

	// create and store new user
	const user = await User.create(userObj);

	if (!user) res.status(400).json({ message: "Invalid user data recieved!" });

	res.status(201).json({ message: `New user ${username} is created!` });
};

const updateUser = async (req, res) => {
	const { id, username, roles, active, password } = req.body;

	// confirm data
	if (
		!id ||
		!username ||
		!Array.isArray(roles) ||
		!roles.length ||
		typeof active !== "boolean"
	) {
		return res.status(400).json({ message: "All fields are required!" });
	}

	const user = await User.findById(id).exec();

	if (!user) return res.status(400).json({ message: "User not found!" });

	// check for duplicates
	const duplicate = await User.findOne({ username })
		.collation({
			locale: "en",
			strength: 2,
		})
		.lean()
		.exec();

	if (duplicate && duplicate._id.toString() !== id) {
		return res.status(409).json({ message: "Duplicate username!" });
	}

	user.username = username;
	user.roles = roles;
	user.active = active;

	if (password) {
		// hash password and save to document
		user.password = await bcrypt.hash(password, 10);
	}

	const updatedUser = await user.save();

	res.json({ message: `${updatedUser.username} updated.` });
};

const deleteUser = async (req, res) => {
	const { id } = req.body;

	if (!id) return res.status(400).json({ message: "User ID is required!" });

	const note = await Note.findOne({ user: id }).lean().exec();

	if (note) {
		return res.status(400).json({ message: "User is assigned to note!" });
	}

	const user = await User.findById(id).exec();

	if (!user) return res.status(400).json({ message: "User not found!" });

	const result = await user.deleteOne();
	const reply = `Username ${result.username} with Id ${result._id} is deleted!`;

	res.json(reply);
};

module.exports = { getAllUsers, createNewUser, updateUser, deleteUser };
