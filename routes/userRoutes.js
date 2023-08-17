const userRouter = require("express").Router();
const authMiddleware = require("../middlewares/authMiddleware");

const {
	addUser,
	verifyUser,
	getCourts,
} = require("../controllers/userController");

userRouter.route("/login").post(verifyUser);
userRouter.route("/register").post(addUser);

userRouter.route("/courts").get(getCourts);

module.exports = userRouter;
