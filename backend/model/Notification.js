const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        min: 2,
        max: 255,
    },
    description: {
        type: String,
        required: false,
        max: 2000,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    isRead: {
        type: [mongoose.ObjectId],
        default: [],
    },
    choreID: {
        type: mongoose.ObjectId,
        default: null,
    },
    notificationType: {
        type: String,
        default: "standard",
    },
    declineChoreReason: {
        type: String,
        default: null,
    },
    numOfSupporters: {
        type: Number,
        default: 0,
    },
    userID: {
        type: mongoose.ObjectId,
        default: null,
    },
    supportingUsers: {
        type: [mongoose.ObjectId],
        default: [],
    },
});

module.exports = mongoose.model("Notification", notificationSchema);
