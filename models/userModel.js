const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
	{
		firstName: {
			type: String,
			required: true,
		},
		lastName: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: true,
		},
		password: {
			type: String,
			required: true,
		},
		profile_picture: {
			type: String,
			default:
				"https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
		},
		gender: {
			type: String,
			enum: ["male", "female", "other"],
		},
		location: {
			type: String,
			default: "toronto",
		},
		player_pickleball: {
			level: {
				type: String,
				enum: ["beginner", "intermediate", "advanced"],
				required: true,
			},
			seeking_type: [
				{
					type: String,
					enum: ["partner", "opponent"],
					required: true,
				},
			],
		},
		availability: {
			time: {
				start: String,
				end: String,
			},
			day: [
				{
					type: String,
					enum: [
						"sunday",
						"monday",
						"tuesday",
						"wednesday",
						"thursday",
						"friday",
						"saturday",
					],
					required: true,
				},
			],
		},
		// invitation: {
		// 	// sending by user to player
		// 	type: mongoose.Schema.ObjectId,
		// 	ref: "invitation",
		// },
		// invites: {
		// 	// received by players
		// 	type: mongoose.Schema.ObjectId,
		// 	ref: "invitation",
		// },
	},
	{
		timestamps: true,
	},
);

userSchema.methods.matchPassword = async function (password) {
	return await bcrypt.compare(password, this.password);
};

userSchema.pre("save", async function (next) {
	const salt = await bcrypt.genSalt(10);
	this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model("user", userSchema);

module.exports = User;
