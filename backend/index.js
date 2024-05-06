const dotenv = require("dotenv");
const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

// Cors options
const corsOptions = { exposedHeaders: "auth-token" };

// Initialise the app
const app = express();
app.use(cors(corsOptions));
app.use(morgan("combined"));

// Import routes
const authRoute = require("./routes/auth");
const householdRoute = require("./routes/household");
const choreRoute = require("./routes/chore");
const notificationRoute = require("./routes/notification");

// Load config
dotenv.config();

// Connect to db
mongoose.set("strictQuery", true);
mongoose.connect(process.env.DB_CONNECT, () => {
    if (process.env.NODE_ENV !== "test") {
        console.log("connected to db");
    }
});

// Middleware
app.use(express.json());

// Route middleware
app.use("/api/user", authRoute);
app.use("/api/household", householdRoute);
app.use("/api/chore", choreRoute);
app.use("/api/notification", notificationRoute);

module.exports = app;
