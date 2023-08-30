const Invitation = require("../models/invitationModel");
const User = require("../models/userModel");


const getDate = (days) => {
	let dateInMilliSeconds = Date.now() + (days * (1000 * 60 * 60 * 24))
	let date = new Date(dateInMilliSeconds).toISOString().split('T')[0];
	return date;
}

const getPlayers = async (req, res) => {
	const userDetail = req.user;

	try {
		// creating a filter for seeking type
		const seeking_type = userDetail.player_pickleball.seeking_type;
		const seek_typ = seeking_type.length === 1 ? { $in: seeking_type } : { $all: ["opponent", "partner"] };

		// Getting players from db who matches the criteria
		const players = await User.find(
			{
				_id: { $ne: userDetail._id },
				"player_pickleball.seeking_type": seek_typ,
				"availability.day": { $in: userDetail.availability.day },
			},
			{
				_id: true,
				firstName: true,
				lastName: true,
				location: true,
				player_pickleball: true,
				availability: true,
			},
		);

		let userIds = [], userDetailsMap = {}, userInvitesMap = {};

		// Users 
		players.forEach(id => {
			userIds.push(id._id)
			userDetailsMap[id._id] = { ...id._doc };
		});

		const startDate = getDate(1), endDate = getDate(14);

		// Invitations
		const invitees = await Invitation.find({
			invitation_accepted: true,
			match_dt: { $gte: new Date(startDate), $lte: new Date(endDate) },
			$or: [{ invitee_id: { $in: userIds } }, { inviter_id: { $in: userIds } }]

		})

		invitees.forEach(invite => {
			const match_d = invite.match_dt.toISOString().split("T")[0];
			if (userInvitesMap[invite.invitee_id])
				userInvitesMap[invite.invitee_id][match_d] = invite;
			else
				userInvitesMap[invite.invitee_id] = { [match_d]: invite };

			// Setting inviter_id
			if (userInvitesMap[invite.inviter_id])
				userInvitesMap[invite.inviter_id][match_d] = invite;
			else
				userInvitesMap[invite.inviter_id] = { [match_d]: invite };
		})


		// const inviters = await Invitation.find({
		// 	invitation_accepted: true, 
		// 	match_dt:{$gte: new Date(startDate), $lte: new Date(endDate)}, 
		// 	inviter_id:{$in:userIds}
		// })

		// inviters.forEach(invite => {
		// 	const match_d = invite.match_dt.toISOString().split("T")[0];
		// 	if (userInvitesMap[invite.inviter_id])
		// 		userInvitesMap[invite.inviter_id][match_d] = invite;
		// 	else
		// 		userInvitesMap[invite.inviter_id] = { [match_d] : invite};
		// })

		const usersInvites = await Invitation.find({
			match_dt: { $gte: new Date(startDate), $lte: new Date(endDate) },
			$or: [{ inviter_id: userDetail._id }, { invitee_id: userDetail._id }]
		})

		const userScheduledAccepted = {}
		const userScheduledNotAccepted = {}
		

		usersInvites.forEach(invite => {
			const match_d = invite.match_dt.toISOString().split("T")[0];

			if (invite.invitation_accepted)
				userScheduledAccepted[match_d] = true;
			else if (!userDetail._id.equals(invite.invitee_id)) {
				if (userScheduledNotAccepted[match_d])
					userScheduledNotAccepted[match_d][invite.invitee_id] = true;
				else
					userScheduledNotAccepted[match_d] = { [invite.invitee_id]: true };
			}
			else if (!userDetail._id.equals(invite.inviter_id)) {
				if (userScheduledNotAccepted[match_d])
					userScheduledNotAccepted[match_d][invite.inviter_id] = true;
				else
					userScheduledNotAccepted[match_d] = { [invite.inviter_id]: true };
			}

		})

		// Generate availability data
		for (let i = 1; i <= 14; i++) {
			let date = getDate(i)

			if (!userScheduledAccepted[date])
				Object.entries(userDetailsMap).forEach(([key, userDetails], _) => {
					let isAvailable = userInvitesMap[userDetails._id] && userInvitesMap[userDetails._id][date] ? false : true;

					if (isAvailable && (!userScheduledNotAccepted[date] || (userScheduledNotAccepted[date] && !userScheduledNotAccepted[date][userDetails._id]))) {
						if (!userDetails.available_dates) {
							userDetailsMap[key] = { ...userDetails, available_dates: [{ [date]: true }] }
						}
						else
							userDetailsMap[key].available_dates.push({ [date]: true })
					}
				})
		}

		res.status(200).send({ data: userDetailsMap });
	} catch (error) {
		res.status(404).send({ msg: error.message })

	}
};

const sendInvitation = async (req, res) => {
	const { match_d, match_st, seeking_type, invitee_id } = req.body;

	if (!invitee_id) res.status(404).send({ msg: "Invitee_id is required" });

	if (!match_d || !match_st || !seeking_type) {
		res.status(404).send({ msg: "invalid details" });
	}

	try {
		const date = new Date(match_d); // Replace this with the desired date

		const options = { weekday: "long" };
		const dayName = date.toLocaleDateString("en-US", options);

		const createInvitation = await Invitation.create({
			inviter_id: req.user._id,
			invitee_id: invitee_id,
			match_day: dayName.toLowerCase(),
			match_dt: match_d,
			match_st: match_st,
			seeking_type: seeking_type,
		});

		if (createInvitation)
			res.status(200).send({ msg: "Invitation send successfully" });
	} catch (err) {
		res.status(404).send({ msg: "Invitation failed", errorMsg: err.message });
	}
};

const getInvitation = async (req, res) => {
	const invitations = await Invitation.find({ inviter_id: req.user._id }, "_id inviter_id match_day match_st match_dt seeking_type invitation_status   ")
		.populate("invitee_id", "_id firstName lastName");
	res.status(200).json({ data: invitations });
};

const getInvites = async (req, res) => {
	const invites = await Invitation.find({ invitee_id: req.user._id }, "_id inviter_id match_day match_st match_dt seeking_type invitation_status")
		.populate("inviter_id", "_id firstName lastName");
	res.status(200).json({ data: invites });
};

const updateInviteStatus = async (req, res) => {
	const { invite_id, status } = req.body;
	const { _id } = req.user;

	if (!invite_id || !status)
		res.status(404).send({ msg: "details are missing" })

	try {
		const updated = await Invitation.findByIdAndUpdate(
			{ _id: invite_id },
			{
				$set: {
					invitation_status: status,
					invitation_accepted: status === "accepted" ? true : false
				}
			})

		await Invitation.updateMany(
			{
				_id: { $ne: updated._id },
				match_dt: updated.match_dt,
				$or: [
					{ inviter_id: { $in: [updated.invitee_id, updated.inviter_id] } }, 
					{ invitee_id: { $in: [updated.invitee_id, updated.inviter_id] } }
				]
			},
			{ invitation_status: "rejected" }
		)

		res.status(200).send({ msg: "success" })
	} catch (error) {
		res.status(404).send({ msg: error.message })
	}
};

module.exports = {
	getPlayers,
	sendInvitation,
	getInvitation,
	getInvites,
	updateInviteStatus,
};
