const mongoose = require("mongoose");

const teacherScheama = new mongoose.Schema({});

const Teacher = mongoose.model("Teacher", teacherScheama);

module.exports = Teacher;
