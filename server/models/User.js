const mongoose = require("mongoose");

// Username, Email, password

const userScheama = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: {
            createdAt: "crdAt",
            updatedAt: "upAt",
        },
    }
);

const User = mongoose.model("User", userScheama);

module.exports = User;
