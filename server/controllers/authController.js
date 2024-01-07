const User = require("../models/User");
const Teacher = require("../models/Teacher");

exports.signup = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        // Validate role
        if (!["user", "teacher"].includes(role)) {
            return res.status(400).json({ message: "Invalid role specified" });
        }

        // Check if email is already registered
        const existingUser = await (role === "user" ? User : Teacher).findOne({
            email,
        });
        if (existingUser) {
            return res
                .status(409)
                .json({ message: "Email is already registered" });
        }

        const model = role === "user" ? User : Teacher;

        const newUser = new model({
            username,
            email,
            password,
        });

        await newUser.save();

        res.status(201).json({
            message: `${
                role.charAt(0).toUpperCase() + role.slice(1)
            } created successfully`,
            [role]: newUser,
        });
    } catch (error) {
        res.status(500).json({
            message: "An unexpected error occured",
            error: error.message,
        });
    }
};
