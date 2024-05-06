const mongoose = require("mongoose");

const householdSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        min: 6,
        max: 255,
    },
    members: {
        type: [mongoose.ObjectId],
        required: true,
    },
    chores: {
        type: [mongoose.ObjectId],
        default: [],
    },
    choreAssignees: {
        type: [mongoose.ObjectId],
        required: true,
    },
    completedChoreCounter: {
        type: Number,
        default: 0,
    },
    completedChoreStreak: {
        type: Number,
        default: 0,
    },
    lastCompletedChoreDate: {
        type: Date,
        default: null,
    },
    dateCreated: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("Household", householdSchema);
