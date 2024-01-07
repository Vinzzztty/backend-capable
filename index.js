require("dotenv").config();

const express = require("express");
const connectDB = require("./server/config/dbConfig");
const cors = require("cors");

const authRoutes = require("./server/routers/authRoutes");

// Make APP
const app = express();
const PORT = 5000 || process.env.PORT;

// CORS Configuration
app.set("trust proxy", 1);
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB();

// Routes
app.use("/api/auth", authRoutes);

app.use("/", (req, res) => {
    res.status(200).json({
        message: "Hello API",
    });
});

// Handle 404 or Page Not Found
app.get("*", (req, res) => {
    res.status(404).json({
        message: "Page Not Found",
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
