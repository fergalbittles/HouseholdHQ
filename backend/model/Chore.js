const mongoose = require("mongoose");

const choreSchema = new mongoose.Schema({
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
    assignee: {
        type: mongoose.ObjectId,
        default: null,
    },
    assigneeRequestPending: {
        type: mongoose.ObjectId,
        default: null,
    },
    priority: {
        type: String,
        default: "None",
        min: 3,
        max: 10,
    },
    dateDue: {
        type: Date,
        default: null,
    },
    dateCreated: {
        type: Date,
        default: Date.now,
    },
    createdBy: {
        type: mongoose.ObjectId,
        required: true,
    },
    updatedBy: {
        type: mongoose.ObjectId,
        default: null,
    },
    lastUpdated: {
        type: Date,
        default: null,
    },
    isCompleted: {
        type: Boolean,
        default: false,
    },
    completedBy: {
        type: mongoose.ObjectId,
        default: null,
    },
    dateCompleted: {
        type: Date,
        default: null,
    },
    isRandomAssignment: {
        type: Boolean,
        default: false,
    },
});

module.exports = mongoose.model("Chore", choreSchema);
