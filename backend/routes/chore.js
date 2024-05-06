const router = require("express").Router();
const verify = require("./verifyToken");
const Chore = require("../model/Chore");
const Household = require("../model/Household");
const Notification = require("../model/Notification");
const User = require("../model/User");
const {
    createChoreValidation,
    updateChoreValidation,
} = require("./validation/choreValidation");
const { exist } = require("@hapi/joi");
const ObjectId = require("mongoose").Types.ObjectId;

// Get chore endpoint
router.get("/", verify, async (req, res) => {
    // Validation
    if (!req.household) {
        res.statusCode = 400;
        res.type("json");
        return res.json({
            error: true,
            message: "The specified user does not belong to a household",
        });
    }

    var choreId = req.query.choreId;

    if (!choreId) {
        res.statusCode = 400;
        res.type("json");
        return res.json({
            error: true,
            message: "A chore ID was not provided",
        });
    }

    if (!ObjectId.isValid(choreId)) {
        res.statusCode = 400;
        res.type("json");
        return res.json({
            error: true,
            message: "The provided chore ID is invalid",
        });
    }

    // Check if the chore exists
    const existingChore = await Chore.findOne({ _id: choreId });

    if (!existingChore) {
        res.statusCode = 400;
        res.type("json");
        return res.json({
            error: true,
            message: "The specified chore does not exist",
        });
    }

    // Check if the chore belongs to the users household
    if (!req.household.chores.includes(choreId)) {
        res.statusCode = 400;
        res.type("json");
        return res.json({
            error: true,
            message:
                "The specified chore does not belong to the specified household",
        });
    }

    res.send({ chore: existingChore });
});

// Get all chores of a household endpoint
router.get("/all", verify, async (req, res) => {
    // Validation
    if (!req.household) {
        res.statusCode = 400;
        res.type("json");
        return res.json({
            error: true,
            message: "The specified user does not belong to a household",
        });
    }

    const allChores = req.household.chores;
    const unsortedChores = await Chore.find({ _id: { $in: allChores } });
    const sortedChores = [];

    for (var i = 0; i < allChores.length; i++) {
        for (var j = 0; j < unsortedChores.length; j++) {
            if (allChores[i].toString() === unsortedChores[j]._id.toString()) {
                sortedChores.push(unsortedChores[j]);
            }
        }
    }

    res.send({ chores: sortedChores });
});

// Create chore endpoint
router.post("/", verify, async (req, res) => {
    // Sanitise input
    if (req?.body?.title) {
        req.body.title = req.body.title.trim();
    }

    // Validation
    if (!req.household) {
        res.statusCode = 400;
        res.type("json");
        return res.json({
            error: true,
            message: "The specified user does not belong to a household",
        });
    }

    if (req.household.chores.length >= process.env.HOUSEHOLD_CHORE_LIMIT) {
        res.statusCode = 400;
        res.type("json");
        return res.json({
            error: true,
            message:
                "The specified household has reached the maximum amount of chores",
        });
    }

    const { error } = createChoreValidation(req.body);

    if (error) {
        res.statusCode = 400;
        res.type("json");
        return res.json({ error: true, message: error.details[0].message });
    }

    // Create new chore
    const chore = new Chore({
        title: req.body.title,
        createdBy: req.user._id,
    });

    // Save new chore
    var savedChore = null;

    try {
        savedChore = await chore.save();
    } catch (err) {
        res.statusCode = 400;
        res.type("json");
        return res.json({ error: true, message: err?.message });
    }

    // Store the chore ID in the household chores array
    const choreID = savedChore._id;
    const householdID = req.household._id;
    const chores = req.household.chores;

    if (!chores.includes(choreID)) {
        chores.push(choreID);
        var update = { chores: chores };
        await Household.findByIdAndUpdate(householdID, update);
    }

    // Emit a socket event
    if (process.env.NODE_ENV !== "test") {
        const io = req.app.get("socketio");
        io.to(req.household._id.toString()).emit("chore-created");
    }

    res.send({ chore: savedChore });
});

// Update chore endpoint
router.patch("/", verify, async (req, res) => {
    // Validation
    if (!req.household) {
        res.statusCode = 400;
        res.type("json");
        return res.json({
            error: true,
            message: "The specified user does not belong to a household",
        });
    }

    var choreId = req.body.choreId;

    if (!choreId) {
        res.statusCode = 400;
        res.type("json");
        return res.json({
            error: true,
            message: "A chore ID was not provided",
        });
    }

    if (!ObjectId.isValid(choreId)) {
        res.statusCode = 400;
        res.type("json");
        return res.json({
            error: true,
            message: "The provided chore ID is invalid",
        });
    }

    // Check if the chore exists
    const existingChore = await Chore.findOne({ _id: choreId });

    if (!existingChore) {
        res.statusCode = 400;
        res.type("json");
        return res.json({
            error: true,
            message: "The specified chore does not exist",
        });
    }

    // Check if the chore is completed
    const isCompleted = existingChore.isCompleted;

    if (isCompleted) {
        res.statusCode = 400;
        res.type("json");
        return res.json({
            error: true,
            message: "Cannot update a chore which has already been completed",
        });
    }

    // Check if the chore belongs to the users household
    if (!req.household.chores.includes(choreId)) {
        res.statusCode = 400;
        res.type("json");
        return res.json({
            error: true,
            message:
                "The specified chore does not belong to the specified household",
        });
    }

    if (!req.body.title) delete req.body.title;
    if (!req.body.dateDue) delete req.body.dateDue;

    const { error } = updateChoreValidation(req.body);

    if (error) {
        res.statusCode = 400;
        res.type("json");
        return res.json({ error: true, message: error.details[0].message });
    }

    // Prepare the updated data
    const update = {};

    if (req.body.title) {
        update.title = req.body.title.trim();
    }

    if (req.body.description) {
        update.description = req.body.description.trim();
    } else {
        update.description = null;
    }

    if (req.body.priority) {
        update.priority = req.body.priority;
    }

    if (req.body.dateDue) {
        update.dateDue = req.body.dateDue;
    }

    update.updatedBy = req.user._id;
    update.lastUpdated = Date.now();

    var updatedChore = null;

    try {
        updatedChore = await Chore.findByIdAndUpdate(choreId, update, {
            new: true,
        });
    } catch (err) {
        res.statusCode = 400;
        res.type("json");
        return res.json({ error: true, message: err?.message });
    }

    // Emit a socket event
    if (process.env.NODE_ENV !== "test") {
        const io = req.app.get("socketio");
        io.to(req.household._id.toString()).emit("chore-updated", {
            choreId: choreId,
        });
    }

    res.send({ chore: updatedChore });
});

// Random assign chore endpoint
router.patch("/assign/random", verify, async (req, res) => {
    // Validation
    if (!req.household) {
        res.statusCode = 400;
        res.type("json");
        return res.json({
            error: true,
            message: "The specified user does not belong to a household",
        });
    }

    var choreId = req.body.choreId;

    if (!choreId) {
        res.statusCode = 400;
        res.type("json");
        return res.json({
            error: true,
            message: "A chore ID was not provided",
        });
    }

    if (!ObjectId.isValid(choreId)) {
        res.statusCode = 400;
        res.type("json");
        return res.json({
            error: true,
            message: "The provided chore ID is invalid",
        });
    }

    // Check if the chore exists
    const existingChore = await Chore.findOne({ _id: choreId });

    if (!existingChore) {
        res.statusCode = 400;
        res.type("json");
        return res.json({
            error: true,
            message: "The specified chore does not exist",
        });
    }

    // Check if the chore is completed
    if (existingChore.isCompleted) {
        res.statusCode = 400;
        res.type("json");
        return res.json({
            error: true,
            message: "Cannot assign a chore which has already been completed",
        });
    }

    // Check if the chore is already assigned
    if (existingChore.assignee) {
        res.statusCode = 400;
        res.type("json");
        return res.json({
            error: true,
            message: "Cannot assign a chore which is already assigned",
        });
    }

    // Check if the chore belongs to the users household
    if (!req.household.chores.includes(choreId)) {
        res.statusCode = 400;
        res.type("json");
        return res.json({
            error: true,
            message:
                "The specified chore does not belong to the specified household",
        });
    }

    // Assign the chore
    const choreAssignees = req.household.choreAssignees;

    if (choreAssignees.length === 0) {
        res.statusCode = 400;
        res.type("json");
        return res.json({
            error: true,
            message: "There are no assignees available within the household",
        });
    }

    const randomAssigneeIndex = Math.floor(
        Math.random() * choreAssignees.length
    );

    const choreAssignee = choreAssignees[randomAssigneeIndex];

    var update = {
        assignee: choreAssignee,
        isRandomAssignment: true,
    };
    const updatedChore = await Chore.findByIdAndUpdate(choreId, update, {
        new: true,
    });

    // Remove the selected ID from the household choreAssignee list
    // If the list is empty then all users have been assigned a chore, populate the list once again with all member IDs
    choreAssignees.splice(randomAssigneeIndex, 1);
    var update = {
        choreAssignees:
            choreAssignees.length > 0 ? choreAssignees : req.household.members,
    };
    await Household.findByIdAndUpdate(req.household._id, update);

    // Create new notification
    const notification = new Notification({
        title: "A chore was randomly assigned to you",
        description: "Chore title: " + updatedChore.title,
        choreID: choreId,
        notificationType: "random-chore-assignment",
    });

    // Save new notification
    var savedNotification = null;

    try {
        savedNotification = await notification.save();
    } catch (err) {
        res.statusCode = 400;
        res.type("json");
        return res.json({ error: true, message: err?.message });
    }

    // Add the notification ID to the assignee's notification list
    await User.findByIdAndUpdate(choreAssignee, {
        $push: { notifications: notification },
    });

    // Emit a socket event
    if (process.env.NODE_ENV !== "test") {
        const io = req.app.get("socketio");
        io.to(req.household._id.toString()).emit("chore-assigned-random", {
            choreId: choreId,
        });
    }

    // Return a response
    res.send({ chore: updatedChore });
});

// Self assign chore endpoint
router.patch("/assign/self", verify, async (req, res) => {
    // Validation
    if (!req.household) {
        res.statusCode = 400;
        res.type("json");
        return res.json({
            error: true,
            message: "The specified user does not belong to a household",
        });
    }

    var choreId = req.body.choreId;

    if (!choreId) {
        res.statusCode = 400;
        res.type("json");
        return res.json({
            error: true,
            message: "A chore ID was not provided",
        });
    }

    if (!ObjectId.isValid(choreId)) {
        res.statusCode = 400;
        res.type("json");
        return res.json({
            error: true,
            message: "The provided chore ID is invalid",
        });
    }

    // Check if the chore exists
    const existingChore = await Chore.findOne({ _id: choreId });

    if (!existingChore) {
        res.statusCode = 400;
        res.type("json");
        return res.json({
            error: true,
            message: "The specified chore does not exist",
        });
    }

    // Check if the chore is completed
    if (existingChore.isCompleted) {
        res.statusCode = 400;
        res.type("json");
        return res.json({
            error: true,
            message: "Cannot assign a chore which has already been completed",
        });
    }

    // Check if the chore is already assigned
    if (existingChore.assignee) {
        res.statusCode = 400;
        res.type("json");
        return res.json({
            error: true,
            message: "Cannot assign a chore which is already assigned",
        });
    }

    // Check if the chore belongs to the users household
    if (!req.household.chores.includes(choreId)) {
        res.statusCode = 400;
        res.type("json");
        return res.json({
            error: true,
            message:
                "The specified chore does not belong to the specified household",
        });
    }

    // Assign the chore
    var update = {
        assignee: req.user._id,
        isRandomAssignment: false,
    };
    const updatedChore = await Chore.findByIdAndUpdate(choreId, update, {
        new: true,
    });

    // Create new notification
    const notification = new Notification({
        title: "You assigned a chore to yourself",
        description: "Chore title: " + updatedChore.title,
        choreID: choreId,
    });

    // Save new notification
    var savedNotification = null;

    try {
        savedNotification = await notification.save();
    } catch (err) {
        res.statusCode = 400;
        res.type("json");
        return res.json({ error: true, message: err?.message });
    }

    // Add the notification ID to the assignee's notification list
    await User.findByIdAndUpdate(req.user._id, {
        $push: { notifications: notification },
    });

    // Emit a socket event
    if (process.env.NODE_ENV !== "test") {
        const io = req.app.get("socketio");
        io.to(req.household._id.toString()).emit("chore-assigned-self", {
            choreId: choreId,
        });
    }

    // Return a response
    res.send({ chore: updatedChore });
});

// Assignee request chore endpoint
router.patch("/assign/request", verify, async (req, res) => {
    // Validation
    if (!req.household) {
        res.statusCode = 400;
        res.type("json");
        return res.json({
            error: true,
            message: "The specified user does not belong to a household",
        });
    }

    var choreId = req.body.choreId;

    if (!choreId) {
        res.statusCode = 400;
        res.type("json");
        return res.json({
            error: true,
            message: "A chore ID was not provided",
        });
    }

    if (!ObjectId.isValid(choreId)) {
        res.statusCode = 400;
        res.type("json");
        return res.json({
            error: true,
            message: "The provided chore ID is invalid",
        });
    }

    // Check if the chore exists
    const existingChore = await Chore.findOne({ _id: choreId });

    if (!existingChore) {
        res.statusCode = 400;
        res.type("json");
        return res.json({
            error: true,
            message: "The specified chore does not exist",
        });
    }

    // Check if the chore is completed
    if (existingChore.isCompleted) {
        res.statusCode = 400;
        res.type("json");
        return res.json({
            error: true,
            message:
                "Cannot request assignment for a chore which has already been completed",
        });
    }

    // Check if the chore is already assigned
    if (!existingChore.assignee) {
        res.statusCode = 400;
        res.type("json");
        return res.json({
            error: true,
            message:
                "Cannot request assignment for a chore which is unassigned",
        });
    }

    // Check if the chore already has a pending assignee request
    if (existingChore.assigneeRequestPending) {
        res.statusCode = 400;
        res.type("json");
        return res.json({
            error: true,
            message:
                "The specified chore already has a pending assignee request",
        });
    }

    // Check if the chore is assigned to the user who is requesting it
    if (existingChore.assignee.toString() === req.user._id.toString()) {
        res.statusCode = 400;
        res.type("json");
        return res.json({
            error: true,
            message:
                "The specified chore is already assigned to the specified user",
        });
    }

    // Check if the chore belongs to the users household
    if (!req.household.chores.includes(choreId)) {
        res.statusCode = 400;
        res.type("json");
        return res.json({
            error: true,
            message:
                "The specified chore does not belong to the specified household",
        });
    }

    // Check if the original assignee is still a member of the household
    if (!req.household.members.includes(existingChore.assignee)) {
        // Assign the chore to the requesting user
        var update = {
            assignee: req.user._id,
            isRandomAssignment: false,
        };
        const updatedChore = await Chore.findByIdAndUpdate(choreId, update, {
            new: true,
        });

        // Emit a socket event
        if (process.env.NODE_ENV !== "test") {
            const io = req.app.get("socketio");
            io.to(req.household._id.toString()).emit("chore-assigned-request", {
                choreId: choreId,
            });
        }

        // Return a response
        res.send({ chore: updatedChore });
    } else {
        // Request assignment for the chore
        var update = {
            assigneeRequestPending: req.user._id,
        };
        const updatedChore = await Chore.findByIdAndUpdate(choreId, update, {
            new: true,
        });

        // Create new notification
        const notification = new Notification({
            title: req.user.name + " requested assignment of your chore",
            description: "Chore title: " + updatedChore.title,
            notificationType: "chore-request",
            choreID: choreId,
        });

        // Save new notification
        var savedNotification = null;

        try {
            savedNotification = await notification.save();
        } catch (err) {
            res.statusCode = 400;
            res.type("json");
            return res.json({ error: true, message: err?.message });
        }

        // Add the notification ID to the assignee's notification list
        await User.findByIdAndUpdate(updatedChore.assignee, {
            $push: { notifications: notification },
        });

        // Emit a socket event
        if (process.env.NODE_ENV !== "test") {
            const io = req.app.get("socketio");
            io.to(req.household._id.toString()).emit("chore-assigned-request", {
                choreId: choreId,
            });
        }

        // Return a response
        res.send({ chore: updatedChore });
    }
});

// Assignee request response chore endpoint
router.patch("/assign/request/respond", verify, async (req, res) => {
    // Validation
    if (!req.household) {
        res.statusCode = 400;
        res.type("json");
        return res.json({
            error: true,
            message: "The specified user does not belong to a household",
        });
    }

    var assigneeRequestResponse = req.body.assigneeRequestResponse;

    if (
        assigneeRequestResponse !== "accept" &&
        assigneeRequestResponse !== "decline"
    ) {
        res.statusCode = 400;
        res.type("json");
        return res.json({
            error: true,
            message: "Request response must be 'accept' or 'decline'",
        });
    }

    var choreId = req.body.choreId;

    if (!choreId) {
        res.statusCode = 400;
        res.type("json");
        return res.json({
            error: true,
            message: "A chore ID was not provided",
        });
    }

    if (!ObjectId.isValid(choreId)) {
        res.statusCode = 400;
        res.type("json");
        return res.json({
            error: true,
            message: "The provided chore ID is invalid",
        });
    }

    // Check if the chore exists
    const existingChore = await Chore.findOne({ _id: choreId });

    if (!existingChore) {
        res.statusCode = 400;
        res.type("json");
        return res.json({
            error: true,
            message: "The specified chore does not exist",
        });
    }

    // Check if the chore is completed
    if (existingChore.isCompleted) {
        res.statusCode = 400;
        res.type("json");
        return res.json({
            error: true,
            message:
                "Cannot alter assignment for a chore which has already been completed",
        });
    }

    // Check if the chore is already assigned
    if (!existingChore.assignee) {
        res.statusCode = 400;
        res.type("json");
        return res.json({
            error: true,
            message:
                "Cannot request assignment for a chore which is unassigned",
        });
    }

    // Check if the chore has a pending assignee request
    if (!existingChore.assigneeRequestPending) {
        res.statusCode = 400;
        res.type("json");
        return res.json({
            error: true,
            message:
                "The specified chore does not have a pending assignee request",
        });
    }

    // Check if the chore is assigned to the user who is requesting it
    if (
        existingChore.assignee.toString() ===
        existingChore.assigneeRequestPending.toString()
    ) {
        res.statusCode = 400;
        res.type("json");
        return res.json({
            error: true,
            message:
                "The specified chore is already assigned to the requesting user",
        });
    }

    // Check if the chore belongs to the users household
    if (!req.household.chores.includes(choreId)) {
        res.statusCode = 400;
        res.type("json");
        return res.json({
            error: true,
            message:
                "The specified chore does not belong to the specified household",
        });
    }

    // Check if the requesting user is still a member of the household
    if (!req.household.members.includes(existingChore.assigneeRequestPending)) {
        // Remove the pending request
        var update = {
            assigneeRequestPending: null,
        };
        const updatedChore = await Chore.findByIdAndUpdate(choreId, update, {
            new: true,
        });

        // Emit a socket event
        if (process.env.NODE_ENV !== "test") {
            const io = req.app.get("socketio");
            io.to(req.household._id.toString()).emit(
                "chore-assigned-response",
                {
                    choreId: choreId,
                }
            );
        }

        // Return a response
        res.send({ chore: updatedChore });
    } else {
        var update;

        // Check if the request is being accepted or declined
        if (assigneeRequestResponse === "accept") {
            update = {
                assigneeRequestPending: null,
                assignee: existingChore.assigneeRequestPending,
                isRandomAssignment: false,
            };
        } else {
            update = {
                assigneeRequestPending: null,
            };
        }

        const updatedChore = await Chore.findByIdAndUpdate(choreId, update, {
            new: true,
        });

        // Create new notification
        const requestResponse =
            assigneeRequestResponse === "accept" ? "accepted" : "declined";

        const notification = new Notification({
            title: req.user.name + " " + requestResponse + " your request",
            description: "Chore title: " + updatedChore.title,
            choreID: choreId,
        });

        // Save new notification
        var savedNotification = null;

        try {
            savedNotification = await notification.save();
        } catch (err) {
            res.statusCode = 400;
            res.type("json");
            return res.json({ error: true, message: err?.message });
        }

        // Add the notification ID to the requester's notification list
        await User.findByIdAndUpdate(existingChore.assigneeRequestPending, {
            $push: { notifications: notification },
        });

        // Emit a socket event
        if (process.env.NODE_ENV !== "test") {
            const io = req.app.get("socketio");
            io.to(req.household._id.toString()).emit(
                "chore-assigned-response",
                {
                    choreId: choreId,
                }
            );
        }

        // Return a response
        res.send({ chore: updatedChore });
    }
});

// Complete chore endpoint
router.patch("/complete", verify, async (req, res) => {
    // Validation
    if (!req.household) {
        res.statusCode = 400;
        res.type("json");
        return res.json({
            error: true,
            message: "The specified user does not belong to a household",
        });
    }

    var choreId = req.body.choreId;

    if (!choreId) {
        res.statusCode = 400;
        res.type("json");
        return res.json({
            error: true,
            message: "A chore ID was not provided",
        });
    }

    if (!ObjectId.isValid(choreId)) {
        res.statusCode = 400;
        res.type("json");
        return res.json({
            error: true,
            message: "The provided chore ID is invalid",
        });
    }

    // Check if the chore exists
    const existingChore = await Chore.findOne({ _id: choreId });

    if (!existingChore) {
        res.statusCode = 400;
        res.type("json");
        return res.json({
            error: true,
            message: "The specified chore does not exist",
        });
    }

    // Check if the chore has already been completed
    const isCompleted = existingChore.isCompleted;

    if (isCompleted) {
        res.statusCode = 400;
        res.type("json");
        return res.json({
            error: true,
            message: "The specified chore has already been completed",
        });
    }

    // Check if the chore belongs to the users household
    if (!req.household.chores.includes(choreId)) {
        res.statusCode = 400;
        res.type("json");
        return res.json({
            error: true,
            message:
                "The specified chore does not belong to the specified household",
        });
    }

    // Update the chore
    var update = {
        isCompleted: true,
        completedBy: req.user._id,
        dateCompleted: Date.now(),
    };
    const updatedChore = await Chore.findByIdAndUpdate(choreId, update, {
        new: true,
    });

    // Update the household chore data
    update = {
        completedChoreCounter: req.household.completedChoreCounter + 1,
    };

    if (!req.household.lastCompletedChoreDate) {
        update.lastCompletedChoreDate = Date.now();
        update.completedChoreStreak = 1;
    } else {
        // Get the date of the last completed chore
        const lastCompletedChore = new Date(
            req.household.lastCompletedChoreDate
        );
        lastCompletedChore.setHours(0, 0, 0, 0);

        // Get yesterdays date
        var yesterday = Date.now();
        yesterday = new Date(yesterday);
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);

        if (lastCompletedChore.getTime() == yesterday.getTime()) {
            update.lastCompletedChoreDate = Date.now();
            update.completedChoreStreak =
                req.household.completedChoreStreak + 1;
        } else if (lastCompletedChore.getTime() < yesterday.getTime()) {
            update.lastCompletedChoreDate = Date.now();
            update.completedChoreStreak = 1;
        }
    }

    await Household.findByIdAndUpdate(req.household._id, update);

    // Create new notification
    const notification = new Notification({
        title: req.user.name + " completed a chore",
        description: "Chore title: " + updatedChore.title,
        choreID: choreId,
    });

    // Save new notification
    var savedNotification = null;

    try {
        savedNotification = await notification.save();
    } catch (err) {
        res.statusCode = 400;
        res.type("json");
        return res.json({ error: true, message: err?.message });
    }

    // Add the notification ID to all user notification lists
    // Ensure that the user who completed the chore will not be notified
    const notifiedUsers = req.household.members;
    const index = notifiedUsers.indexOf(req.user._id);
    notifiedUsers.splice(index, 1);

    await User.updateMany(
        { _id: { $in: notifiedUsers } },
        { $push: { notifications: notification } }
    );

    // Emit a socket event
    if (process.env.NODE_ENV !== "test") {
        const io = req.app.get("socketio");
        io.to(req.household._id.toString()).emit("chore-completed", {
            choreId: choreId,
        });
    }

    res.send({ chore: updatedChore });
});

// Delete chore endpoint
router.delete("/", verify, async (req, res) => {
    // Validation
    if (!req.household) {
        res.statusCode = 400;
        res.type("json");
        return res.json({
            error: true,
            message: "The specified user does not belong to a household",
        });
    }

    var choreId = req.query.choreId;

    if (!choreId) {
        res.statusCode = 400;
        res.type("json");
        return res.json({
            error: true,
            message: "A chore ID was not provided",
        });
    }

    if (!ObjectId.isValid(choreId)) {
        res.statusCode = 400;
        res.type("json");
        return res.json({
            error: true,
            message: "The provided chore ID is invalid",
        });
    }

    // Check if the chore exists
    const existingChore = await Chore.findOne({ _id: choreId });

    if (!existingChore) {
        res.statusCode = 400;
        res.type("json");
        return res.json({
            error: true,
            message: "The specified chore does not exist",
        });
    }

    // Check if the chore belongs to the users household
    if (!req.household.chores.includes(choreId)) {
        res.statusCode = 400;
        res.type("json");
        return res.json({
            error: true,
            message:
                "The specified chore does not belong to the specified household",
        });
    }

    // Delete the chore
    try {
        await Chore.deleteOne({ _id: choreId });
    } catch (err) {
        res.statusCode = 400;
        res.type("json");
        return res.json({ error: true, message: err?.message });
    }

    // Remove the chore ID from the household
    const chores = req.household.chores;
    const index = chores.indexOf(choreId);
    chores.splice(index, 1);

    const update = { chores: chores };
    await Household.findByIdAndUpdate(req.household._id, update);

    // Emit a socket event
    if (process.env.NODE_ENV !== "test") {
        const io = req.app.get("socketio");
        io.to(req.household._id.toString()).emit("chore-deleted", {
            choreId: choreId,
        });
    }

    res.send({ chore: "Chore deleted successfully" });
});

// Decline chore endpoint
router.patch("/assign/random/decline", verify, async (req, res) => {
    // Validation
    if (!req.household) {
        res.statusCode = 400;
        res.type("json");
        return res.json({
            error: true,
            message: "The specified user does not belong to a household",
        });
    }

    const declineReason = req.body.reason;

    if (!declineReason) {
        res.statusCode = 400;
        res.type("json");
        return res.json({
            error: true,
            message:
                "A reason must be provided to decline a random chore assignment",
        });
    }

    var choreId = req.body.choreId;

    if (!choreId) {
        res.statusCode = 400;
        res.type("json");
        return res.json({
            error: true,
            message: "A chore ID was not provided",
        });
    }

    if (!ObjectId.isValid(choreId)) {
        res.statusCode = 400;
        res.type("json");
        return res.json({
            error: true,
            message: "The provided chore ID is invalid",
        });
    }

    // Check if the chore exists
    const existingChore = await Chore.findOne({ _id: choreId });

    if (!existingChore) {
        res.statusCode = 400;
        res.type("json");
        return res.json({
            error: true,
            message: "The specified chore does not exist",
        });
    }

    // Check if the chore is completed
    if (existingChore.isCompleted) {
        res.statusCode = 400;
        res.type("json");
        return res.json({
            error: true,
            message:
                "Cannot alter assignment for a chore which has already been completed",
        });
    }

    // Check if the chore is assigned to a user
    if (!existingChore.assignee) {
        res.statusCode = 400;
        res.type("json");
        return res.json({
            error: true,
            message:
                "Cannot decline assignment for a chore which is unassigned",
        });
    }

    // Check if the chore is assigned to the user who is declining it
    if (existingChore.assignee.toString() !== req.user._id.toString()) {
        res.statusCode = 400;
        res.type("json");
        return res.json({
            error: true,
            message:
                "The specified user is not assigned to the specified chore",
        });
    }

    // Check if the chore belongs to the users household
    if (!req.household.chores.includes(choreId)) {
        res.statusCode = 400;
        res.type("json");
        return res.json({
            error: true,
            message:
                "The specified chore does not belong to the specified household",
        });
    }

    // Check if the chore has a pending assignee request
    var newAssignee = null;

    if (
        existingChore.assigneeRequestPending &&
        req.household.members.includes(existingChore.assigneeRequestPending)
    ) {
        // Assign the chore to the requesting user
        newAssignee = existingChore.assigneeRequestPending;
    }

    // Unassign the chore
    const updatedChore = await Chore.findByIdAndUpdate(
        choreId,
        {
            assignee: newAssignee,
            assigneeRequestPending: null,
            isRandomAssignment: false,
        },
        {
            new: true,
        }
    );

    // Create new notification for other household members
    var notification = new Notification({
        title: req.user.name + " declined a chore",
        description: "Chore title: " + updatedChore.title,
        choreID: choreId,
        declineChoreReason: declineReason,
        userID: req.user._id,
        notificationType: "decline-chore-assignment",
    });

    // Save new notification
    var savedNotification = null;

    try {
        savedNotification = await notification.save();
    } catch (err) {
        res.statusCode = 400;
        res.type("json");
        return res.json({ error: true, message: err?.message });
    }

    // Add the notification ID to all user notification lists
    await User.updateMany(
        { _id: { $in: req.household.members } },
        { $push: { notifications: notification } }
    );

    if (newAssignee) {
        notification = new Notification({
            title: req.user.name + " accepted your request",
            description: "Chore title: " + updatedChore.title,
            choreID: choreId,
        });

        // Save new notification
        savedNotification = null;

        try {
            savedNotification = await notification.save();
        } catch (err) {
            res.statusCode = 400;
            res.type("json");
            return res.json({ error: true, message: err?.message });
        }

        // Add the notification ID to the requester's notification list
        await User.findByIdAndUpdate(newAssignee, {
            $push: { notifications: notification },
        });
    }

    // Emit a socket event
    if (process.env.NODE_ENV !== "test") {
        const io = req.app.get("socketio");
        io.to(req.household._id.toString()).emit("chore-assignment-declined", {
            choreId: choreId,
        });
    }

    // Return a response
    res.send({ chore: updatedChore });
});

module.exports = router;
