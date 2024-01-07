const mongoose = require("mongoose");

const userScheama = new mongoose.Schema({});

const User = mongoose.model("User", userScheama);

module.exports = User;
