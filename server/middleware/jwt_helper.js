const JWT = require("jsonwebtoken");

module.exports = {
    signAccessToken: (userId) => {
        return new Promise((resolve, reject) => {
            const payload = {
                userId: userId.toString(),
            };

            const secret = process.env.SECRET_TOKEN;
            const options = {
                expiresIn: "1y",
                audience: userId.toString(),
            };
            JWT.sign(payload, secret, options, (err, token) => {
                if (err) reject(err);
                resolve(token);
            });
        });
    },
    verifyAccessToken: (req, res, next) => {
        if (!req.headers["authorization"])
            return res.status(401).json({ error: "Unathorized" });
        const authHeader = req.headers["authorization"];
        const bearerToken = authHeader.split(" ");
        const token = bearerToken[1];

        JWT.verify(token, process.env.SECRET_TOKEN, (err, payload) => {
            if (err) {
                if (err.name === "JsonWebTokenError") {
                    return res.status(401).json({ error: "Jwt Token Expired" });
                } else {
                    return res.status(401).json({ error: "Invalid Signature" });
                }
            }

            req.payload = payload;
            next();
        });
    },
};
