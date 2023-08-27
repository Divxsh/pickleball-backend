const mongoose = require("mongoose");

const invitationSchema = new mongoose.Schema({
	inviter_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "user", // Assuming you have a 'User' model
		required: true,
	},
	invitee_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "user", // Assuming you have a 'User' model
		required: true,
	},
	match_day: {
		type: String,
		enum: [
			"monday",
			"tuesday",
			"wednesday",
			"thursday",
			"friday",
			"saturday",
			"sunday",
		],
		required: true,
	},
	match_st: {
		type: String,
		required: true,
	},
	match_dt: {
		type: Date, 
		required: true,
	},
	seeking_type: {
		type: String,
		enum: ["partner", "opponent"],
		required: true,
	},
	invitation_accepted: {
		type: Boolean,
		default: false,
	},
	invitation_status: {
		type: String,
		enum: ["accepted", "pending", "rejected"],
		default: "pending",
	},
});

const Invitation = mongoose.model("invitation", invitationSchema);

module.exports = Invitation;
