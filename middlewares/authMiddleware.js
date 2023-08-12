const jwt = require("jsonwebtoken");
const User = require("../models/userModel.js");

const authMiddleware = async (req, res, next) => {
	console.log("authMiddleware Executed", req.body);

	let token = req.headers["authorization"];

	if (!token) {
		return res.status(404).send({ msg: "Please login or register." });
	} else {
		try {
			token = token.split(" ")[1];
			const decoded = jwt.verify(token, process.env.SECRET_KEY);

			req.user = await User.findById(decoded.id).select("-password");

			next();
		} catch (e) {
			// if token is incorrect
			return res.status(400).send({ msg: "authorization failed" });
		}
	}
};

module.exports = authMiddleware;
