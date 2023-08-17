const { Schema, model } = require("mongoose");

const courtSchema = new Schema({
	name: String,
	NoOfCourts: Number,
	lights: Boolean,
	NetType: String,
});

const courtModel = model("court", courtSchema);

module.exports = courtModel;
