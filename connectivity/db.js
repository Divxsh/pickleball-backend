const mongoose = require("mongoose");
const colors = require("colors");

const connectDB = async () => {
	try {
		const MongoUri = process.env.MONGO_URI
		console.log("URI", MongoUri)
		const conn = await mongoose.connect(MongoUri, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		});
		console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline);
	} catch (error) {
		console.log(`Error: ${error.message}`.red.bold);
		process.exit();
	}
};

module.exports = connectDB;
