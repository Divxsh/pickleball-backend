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
			gender,
			location,
			player_pickleball: {
				level: player_level.toLowerCase(),
				seeking_type,
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
			location: newUser.location,
			level: newUser.player_pickleball.level,
			availability_day: newUser.availability.day,
			availability_time: newUser.availability.time,
			seeking_type: newUser.player_pickleball.seeking_type,
			auth_token: generateToken(newUser._id),
		};

		return res.status(201).send({
			msg: "User registered succesfully",
			data: responseData,
		});
	} catch (err) {
		console.log("err", err);
		return res
			.status(400)
			.send({ msg: err ? err.message : "User not created" });
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
				firstName: user.firstName,
				lastName: user.lastName,
				email: user.email,
				location: user.location,
				level: user.player_pickleball.level,
				availability_day: user.availability.day,
				availability_time: user.availability.time,
				seeking_type: user.player_pickleball.seeking_type,
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
