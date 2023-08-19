const userRouter = require("express").Router();
const authMiddleware = require("../middlewares/authMiddleware");

const {
	addUser,
	verifyUser,
	getCourts,
} = require("../controllers/userController");

userRouter.get("/", (req, res) => {
	res.status(200).send("Api Working");
});
userRouter.route("/login").post(verifyUser);
userRouter.route("/register").post(addUser);

userRouter.route("/courts").get(getCourts);

module.exports = userRouter;
