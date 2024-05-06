const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        min: 6,
        max: 255,
    },
    email: {
        type: String,
        required: true,
        min: 6,
        max: 255,
    },
    password: {
        type: String,
        required: true,
        min: 6,
        max: 1024,
    },
    householdID: {
        type: mongoose.ObjectId,
        default: null,
    },
    notifications: {
        type: [mongoose.ObjectId],
        default: [],
    },
    profilePhoto: {
        type: Number,
        default: -1,
    },
    date: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("User", userSchema);
