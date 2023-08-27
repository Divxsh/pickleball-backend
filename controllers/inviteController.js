const Invitation = require("../models/invitationModel");
const User = require("../models/userModel");

const getPlayers = async (req, res) => {
	const userDetail = req.user;

	const seeking_type = userDetail.player_pickleball.seeking_type;
	const seek_typ = seeking_type.length === 1 ? seeking_type : {$all: ["opponent", "partner"]};

	// Query
	const players = await User.find(
		{
			_id: { $ne: userDetail._id },
			"player_pickleball.seeking_type": seek_typ,
			"availability.day": { $in: userDetail.availability.day },
		},
		{
			_id:true,
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
		userDetailsMap[id._id] = {...id._doc};
	});
	
	// Invitations
	const invitations = await Invitation.find({invitation_accepted: true, match_dt:{$gt: new Date("2023-08-25")}})
	invitations.forEach(invite => {
		const match_d = invite.match_dt.toISOString().split("T")[0];
		if (userInvitesMap[invite.invitee_id])
			userInvitesMap[invite.invitee_id][match_d] = invite;
		else
			userInvitesMap[invite.invitee_id] = { [match_d] : invite};
	})


	// Generate availability data
	for(let i = 1; i <= 14; i++){
  		let dateInMilliSeconds = Date.now() + (i*(1000*60*60*24))
    	let date = new Date(dateInMilliSeconds).toISOString().split('T')[0];

		Object.entries(userDetailsMap).forEach(([key, userDetails],idx) => { 
			let isAvailable = userInvitesMap[userDetails._id] &&  userInvitesMap[userDetails._id][date] ? false : true;			
			if (isAvailable) {
				if (!userDetails.available_dates){
					console.log("Not present in user",userDetailsMap[key]);
					userDetailsMap[key] = {...userDetails, available_dates: [{[date]:true}]}
				}
				else
					userDetailsMap[key].available_dates.push({[date]:true})
			}
		})
	}

	res.status(200).send({ data: userDetailsMap });
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
	const invitations = await Invitation.find({
		inviter_id: req.user._id,
	}).populate("invitee_id");
	res.status(200).json(invitations);
};

const getInvites = async (req, res) => {
	const invites = await Invitation.find({ invitee_id: req.user._id }).populate(
		"inviter_id",
	);
	res.status(200).json(invites);
};

const updateInviteStatus = (req, res) => {

};

module.exports = {
	getPlayers,
	sendInvitation,
	getInvitation,
	getInvites,
	updateInviteStatus,
};
