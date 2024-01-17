const User = require("../models/User");
const Teacher = require("../models/Teacher");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
    signAccessToken,
    verifyAccessToken,
} = require("../middleware/jwt_helper");

exports.signup = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        // Validate role case-insensitively
        if (!["user", "teacher"].includes(role.toLowerCase())) {
            return res.status(400).json({ message: "Invalid role specified" });
        }
        // Check if email is already registered
        const existingUser = await (role.toLowerCase() === "user"
            ? User
            : Teacher
        ).findOne({
            email,
        });
        if (existingUser) {
            return res
                .status(409)
                .json({ message: "Email is already registered" });
        }

        const model = role.toLowerCase() === "user" ? User : Teacher;

        const hashPassword = await bcryptjs.hash(password, 8);

        const newUser = new model({
            username,
            email,
            password: hashPassword,
            role: role,
        });

        await newUser.save();

        res.status(201).json({
            message: `${
                role.charAt(0).toUpperCase() + role.slice(1)
            } created successfully`,
            [role.toLowerCase()]: newUser,
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

        // Check in the User Collection
        let user = await User.findOne({ email });

        // If the user is not found in the User collection, check in the Teacher collection
        if (!user) {
            user = await Teacher.findOne({ email });

            // If the user is not found in either collection, respond with an error
            if (!user) {
                return res.status(401).json({
                    message: "Email not found",
                });
            }
        }

        // Validate the password
        const isPasswordMatch = await bcryptjs.compare(password, user.password);

        if (!isPasswordMatch) {
            return res.status(401).json({
                message: "Invalid password",
            });
        }

        // Determine the role (User or Teacher)
        const role = user instanceof User ? "User" : "Teacher";

        // Generate and send an access token upon successful login
        const accessToken = await signAccessToken(user._id);

        res.status(200).json({
            message: `Login Successfully as ${role}`,
            token: accessToken,
        });
    } catch (error) {
        res.status(500).json({
            message: "An unexpected error occured",
            error: error.message,
        });
    }
};

exports.verify = async (req, res) => {
    const tokenHeaderKey = "jwt-token";
    const authToken = req.headers[tokenHeaderKey];
    try {
        const verified = jwt.verify(authToken, jwtSecretKey);
        if (verified) {
            return res
                .status(200)
                .json({ status: "logged in", message: "success" });
        } else {
            // Access Denied
            return res
                .status(401)
                .json({ status: "invalid auth", message: "error" });
        }
    } catch (error) {
        // Access Denied
        return res
            .status(401)
            .json({ status: "invalid auth", message: "error" });
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

exports.logout = async (req, res) => {
    try {
        logoutUser(req, res);
        res.status(200).json({
            message: "User logged out successfully",
            session: req.session,
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message,
        });
    } finally {
        // Clear session data
        req.session = null;
    }
};

const logoutUser = (req, res, next) => {
    const token = req.headers["authorization"];
    if (token) {
        jwt.verify(token, process.env.SECRET_TOKEN, (err, decoded) => {
            if (err) {
                return err;
            }

            decoded.exp = Date.now();
        });
    }
};
