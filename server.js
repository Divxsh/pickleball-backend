const express = require("express");
const app = require("express")();
require("dotenv").config();
require("./connectivity/db")();
const cors = require("cors");
const authMiddleware = require("./middlewares/authMiddleware");

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/api", require("./routes/userRoutes"));
app.use("/api", authMiddleware, require("./routes/inviteRoutes"));

app.listen(PORT, () => console.log(`Server is listening at ${PORT}`));
