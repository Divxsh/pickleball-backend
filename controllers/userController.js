const User = require("../models/userModel");
const Court = require("../models/courtModel");
const generateToken = require("../helpers/generateToken");

const addUser = async (req, res) => {
	console.log(req.body);
	const {
		firstName,
		lastName,
		email,
		password,
		gender,
		location,
		player_level,
		availability_time,
		availability_day,
		seeking_type,
		profile_picture,
	} = req.body;

	if (!firstName || !lastName || !email || !password) {
		return res.status(400).send({ msg: "User details are missing" });
	}

	try {
		const userExist = await User.findOne({ email: email.toLowerCase() });

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
			gender: gender.toLowerCase(),
			player_pickleball: {
				level: player_level.toLowerCase(),
				seeking_type: seeking_type.toLowerCase(),
			},
			availability: {
				time: {
					start: availability_time.start,
					end: availability_time.end,
				},
				day: availability_day,
			},
			profile_picture,
		});

		const responseData = {
			_id: newUser._id,
			firstName: newUser.firstName,
			lastName: newUser.lastName,
			email: newUser.email,
			profile_picture: newUser.profile_picture,
			auth_token: generateToken(this._id),
		};

		return res.status(201).send({
			msg: "User registered succesfully",
			data: responseData,
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

		return res.status(200).send({
			msg: "Login successfull",
			data: {
				_id: user._id,
				email: user.email,
				profile_picture: user.profile_picture,
				auth_token: generateToken(user._id),
			},
		});
	} catch (e) {
		res.status(400).send({ msg: "Login failed" });
	}
};

const getCourts = async (req, res) => {
	const data = await Court.find();

	res.status(200).json(data);
};

module.exports = { addUser, verifyUser, getCourts };
