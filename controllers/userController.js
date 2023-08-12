const User = require("../models/userModel");
const generateToken = require("../helpers/generateToken");

const addUser = async (req, res) => {
	const { firstName, lastName, email, password, profile_picture } = req.body;

	if (!firstName ||  !lastName || !email || !password) {
		return res.status(400).send({ msg: "User details are missing" });
	}

	try {
		const userExist = await User.findOne({
			$or: [{ email: email.toLowerCase() }],
		});

		if (userExist) {
			return res.status(404).send({
				msg: "User already registered",
				description: "Try to use new email or unique username",
			});
		}

		const newUser = await User.create({
			firstName,
			lastName,
			email: email.toLowerCase(),
			password,
			profile_picture,
		});

		const responseData = {
			_id: newUser._id,
			firstName:newUser.firstName,
			lastName:newUser.lastName,
			email: newUser.email,
			profile_picture: newUser.profile_picture,
			auth_token: generateToken(this._id),
		};
		return res.status(201).send({
			msg:"User registered succesfully",
			data: responseData
		});
	} catch (err) {
		return res.status(400).send({ msg: "User not created", err: err });
	}
};

const verifyUser = async (req, res) => {
	const { email, password } = req.body;

	if (!email || !password)
		res.status(404).send({ msg: "Login detail are missing" });

	try {
		const user = await User.findOne({ email: email.toLowerCase() });

		if (!user) {
			return res.status(400).send({ msg: "user not found" });
		}
		if (!(await user.matchPassword(password))) {
			return res.status(400).send({ msg: "password is wrong" });
		}

		return res.status(200).send({msg:"Login successfull",
		data:{
			_id: user._id,
			email: user.email,
			profile_picture: user.profile_picture,
			auth_token: generateToken(user._id),
		}});
	} catch (e) {
		res.status(400).send({ msg: "Login failed" });
	}
};

module.exports = { addUser, verifyUser };
