const mongoose = require("mongoose");

const url = "mongodb+srv://riyagoyal:7gIc2kfYvxO5y41v@personalprojects.yjloqty.mongodb.net/devTinder";

const connectDB = async () => {
    await mongoose.connect(url);
}

module.exports = connectDB;