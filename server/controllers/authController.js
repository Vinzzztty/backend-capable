const User = require("../models/User");
const Teacher = require("../models/Teacher");
const bcryptjs = require("bcryptjs");
const {
    signAccessToken,
    verifyAccessToken,
} = require("../middleware/jwt_helper");

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

        const hashPassword = await bcryptjs.hash(password, 8);

        const newUser = new model({
            username,
            email,
            password: hashPassword,
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

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(401).json({
                message: "Email not found",
            });
        }

        const isPasswordMatch = await bcryptjs.compare(password, user.password);

        if (!isPasswordMatch) {
            return res.status(401).json({
                message: "Invalid password",
            });
        }

        const accessToken = await signAccessToken(user._id);

        res.status(200).json({
            message: "Login Successfully",
            token: accessToken,
        });
    } catch (error) {
        res.status(500).json({
            message: "An unexpected error occured",
            error: error.message,
        });
    }
};

exports.getUserDetails = async (req, res) => {
    try {
        verifyAccessToken(req, res, async (err) => {
            if (err) {
                return res.status(401).json({ error: "Unathorized" });
            }

            const userId = req.payload.aud;

            const user = await User.findOne({ _id: userId });

            if (!user) {
                return res.status(404).json({
                    message: "user not found",
                });
            }

            res.status(200).json({
                status: "success",
                data: user,
            });
        });
    } catch (error) {
        res.status(500).json({
            message: "An unexpected error occured",
            error: error.message,
        });
    }
};
