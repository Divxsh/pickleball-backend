const {
	getInvitation,
	getInvites,
	getPlayers,
	sendInvitation,
	updateInviteStatus,
} = require("../controllers/inviteController");

const inviteRouter = require("express").Router();

inviteRouter.get("/getinvitations", getInvitation);
inviteRouter.get("/getinvites", getInvites);
inviteRouter.get("/getplayers", getPlayers);
inviteRouter.post("/sendinvitation", sendInvitation);
inviteRouter.post("/updateinvitestatus", updateInviteStatus);

module.exports = inviteRouter;
