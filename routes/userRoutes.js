const userRouter = require("express").Router();
const authMiddleware = require("../middlewares/authMiddleware");

const {
	addUser,
	verifyUser,
} = require("../controllers/userController");

userRouter.route("/login").post(verifyUser);
userRouter.route("/register").post(addUser);

module.exports = userRouter;
