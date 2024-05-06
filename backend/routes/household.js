const router = require("express").Router();
const verify = require("./verifyToken");
const Household = require("../model/Household");
const User = require("../model/User");
const Notification = require("../model/Notification");
const {
    createHouseholdValidation,
    inviteValidation,
} = require("./validation/householdValidation");
const ObjectId = require("mongoose").Types.ObjectId;
const { transporter } = require("../util/transporter");

// Get household info
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

    const usersResponse = await User.find(
        { _id: { $in: req.household.members } },
        "_id name profilePhoto"
    );

    var completedChoreStreak = 0;

    if (req.household.lastCompletedChoreDate) {
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

        if (lastCompletedChore.getTime() >= yesterday.getTime()) {
            completedChoreStreak = req.household.completedChoreStreak;
        }
    }

    const householdResponse = {
        _id: req.household._id,
        name: req.household.name,
        members: usersResponse,
        chores: req.household.chores,
        choreAssignees: req.household.choreAssignees,
        completedChoreCounter: req.household.completedChoreCounter,
        completedChoreStreak: completedChoreStreak,
        lastCompletedChoreDate: req.household.lastCompletedChoreDate,
        dateCreated: req.household.dateCreated,
    };

    res.send({ household: householdResponse });
});

// Create household endpoint
router.post("/create", verify, async (req, res) => {
    // Validation
    if (req.user.householdID != null) {
        res.statusCode = 400;
        res.type("json");
        return res.json({
            error: true,
            message: "The specified user already belongs to a household",
        });
    }

    const { error } = createHouseholdValidation(req.body);

    if (error) {
        res.statusCode = 400;
        res.type("json");
        return res.json({ error: true, message: error.details[0].message });
    }

    // Create new household
    const household = new Household({
        name: req.body.name,
        members: [req.user._id],
        choreAssignees: [req.user._id],
    });

    // Save new household
    var savedHousehold = null;

    try {
        savedHousehold = await household.save();
    } catch (err) {
        res.statusCode = 400;
        res.type("json");
        return res.json({ error: true, message: err?.message });
    }

    // Update the household ID stored within the user data
    const update = { householdID: savedHousehold._id };
    await User.findByIdAndUpdate(req.user._id, update);

    res.send({ householdId: savedHousehold._id });
});

// Join household endpoint
router.patch("/join", verify, async (req, res) => {
    // Validation
    if (req.user.householdID != null) {
        res.statusCode = 400;
        res.type("json");
        return res.json({
            error: true,
            message: "The specified user already belongs to a household",
        });
    }

    var id = req.body.householdId;

    if (!id) {
        res.statusCode = 400;
        res.type("json");
        return res.json({
            error: true,
            message: "A household ID was not provided",
        });
    }

    if (!ObjectId.isValid(id)) {
        res.statusCode = 400;
        res.type("json");
        return res.json({
            error: true,
            message: "The provided household ID is invalid",
        });
    }

    // Check if the household exists
    const existingHousehold = await Household.findOne({ _id: id });

    if (!existingHousehold) {
        res.statusCode = 400;
        res.type("json");
        return res.json({
            error: true,
            message: "The specified household does not exist",
        });
    }

    // Check if the household has reached its limit
    const members = existingHousehold.members;

    if (members.length >= process.env.HOUSEHOLD_LIMIT) {
        res.statusCode = 400;
        res.type("json");
        return res.json({
            error: true,
            message: "The specified household has reached capacity",
        });
    }

    // Join the household
    var updatedHousehold;

    if (!members.includes(req.user._id)) {
        members.push(req.user._id);

        // Add the user to the list of possible chore assignees
        const choreAssignees = existingHousehold.choreAssignees;
        if (!choreAssignees.includes(req.user._id)) {
            choreAssignees.push(req.user._id);
        }

        var update = { members: members, choreAssignees: choreAssignees };
        updatedHousehold = await Household.findByIdAndUpdate(id, update, {
            new: true,
        });
    }

    // Update the household ID stored within the user data
    update = { householdID: id };
    await User.findByIdAndUpdate(req.user._id, update);

    // Create new notification
    const notification = new Notification({
        title: req.user.name + " joined the household",
        description:
            "There are now " + updatedHousehold.members.length + " members",
    });

    // Save new household
    var savedNotification = null;

    try {
        savedNotification = await notification.save();
    } catch (err) {
        res.statusCode = 400;
        res.type("json");
        return res.json({ error: true, message: err?.message });
    }

    // Add the notification ID to all user notification lists
    // Ensure that the user who joined the household will not be notified
    const notifiedUsers = updatedHousehold.members;
    const index = notifiedUsers.indexOf(req.user._id);
    notifiedUsers.splice(index, 1);

    await User.updateMany(
        { _id: { $in: notifiedUsers } },
        { $push: { notifications: notification } }
    );

    // Emit a socket event
    if (process.env.NODE_ENV !== "test") {
        const io = req.app.get("socketio");
        io.to(id.toString()).emit("user-joined-household");
    }

    res.send({ householdId: id });
});

// Leave household endpoint
router.patch("/leave", verify, async (req, res) => {
    // Validation
    if (!req.user.householdID) {
        res.statusCode = 400;
        res.type("json");
        return res.json({
            error: true,
            message: "The specified user does not belong to a household",
        });
    }

    var householdId = req.household._id;

    // Check if the household exists
    const existingHousehold = await Household.findOne({ _id: householdId });

    if (!existingHousehold) {
        res.statusCode = 400;
        res.type("json");
        return res.json({
            error: true,
            message: "The specified household does not exist",
        });
    }

    // Check if the household has reached its limit
    const members = existingHousehold.members;

    if (members.length === 0) {
        res.statusCode = 400;
        res.type("json");
        return res.json({
            error: true,
            message:
                "The specified household does not have any members to remove",
        });
    }

    // Ensure that the user belongs to this household
    if (!members.includes(req.user._id)) {
        res.statusCode = 400;
        res.type("json");
        return res.json({
            error: true,
            message:
                "The specified user does not belong to the specified household",
        });
    }

    // Remove the user ID from the household
    var updatedHousehold;

    if (members.includes(req.user._id)) {
        var index = members.indexOf(req.user._id);
        members.splice(index, 1);

        // Remove the user ID from the list of possible chore assignees
        const choreAssignees = existingHousehold.choreAssignees;
        if (choreAssignees.includes(req.user._id)) {
            index = choreAssignees.indexOf(req.user._id);
            choreAssignees.splice(index, 1);
        }

        var update = { members: members, choreAssignees: choreAssignees };
        updatedHousehold = await Household.findByIdAndUpdate(
            householdId,
            update,
            {
                new: true,
            }
        );
    }

    // Update the household ID stored within the user data
    update = { householdID: null };
    await User.findByIdAndUpdate(req.user._id, update);

    // Create new notification
    const notification = new Notification({
        title: req.user.name + " left the household",
        description:
            "There are now " + updatedHousehold.members.length + " members",
    });

    // Save new household
    var savedNotification = null;

    try {
        savedNotification = await notification.save();
    } catch (err) {
        res.statusCode = 400;
        res.type("json");
        return res.json({ error: true, message: err?.message });
    }

    // Add the notification ID to all user notification lists
    // Ensure that the user who joined the household will not be notified
    const notifiedUsers = updatedHousehold.members;
    const userIndex = notifiedUsers.indexOf(req.user._id);
    notifiedUsers.splice(userIndex, 1);

    await User.updateMany(
        { _id: { $in: notifiedUsers } },
        { $push: { notifications: notification } }
    );

    // Emit a socket event
    if (process.env.NODE_ENV !== "test") {
        const io = req.app.get("socketio");
        io.to(householdId.toString()).emit("user-left-household");
    }

    res.send({ householdId: null });
});

// Invite household members endpoint
router.post("/invite", verify, async (req, res) => {
    // Sanitise input
    if (req?.body?.email) {
        req.body.email = req.body.email.trim().toLowerCase();
    }

    // Validation
    const { error } = inviteValidation(req.body);

    if (error) {
        res.statusCode = 400;
        res.type("json");
        return res.json({ error: true, message: error.details[0].message });
    }

    if (req.user.email === req.body.email) {
        res.statusCode = 400;
        res.type("json");
        return res.json({
            error: true,
            message: "You cannot send an invite to yourself",
        });
    }

    if (!req.user.householdID) {
        res.statusCode = 400;
        res.type("json");
        return res.json({
            error: true,
            message: "The specified user does not belong to a household",
        });
    }

    var householdId = req.household._id;

    // Check if the household exists
    const existingHousehold = await Household.findOne({ _id: householdId });

    if (!existingHousehold) {
        res.statusCode = 400;
        res.type("json");
        return res.json({
            error: true,
            message: "The specified household does not exist",
        });
    }

    // Check if the household has reached its limit
    const members = existingHousehold.members;

    if (members.length >= 10) {
        res.statusCode = 400;
        res.type("json");
        return res.json({
            error: true,
            message:
                "The specified household does not have room for any more members",
        });
    }

    // Ensure that the user belongs to this household
    if (!members.includes(req.user._id)) {
        res.statusCode = 400;
        res.type("json");
        return res.json({
            error: true,
            message:
                "The specified user does not belong to the specified household",
        });
    }

    // Check if the invite recipient already has an account
    const existingUser = await User.findOne({ email: req.body.email });

    // Check if the recipient already belongs to the household
    if (
        existingUser?.householdID?.toString() === req.household._id.toString()
    ) {
        res.statusCode = 400;
        res.type("json");
        return res.json({
            error: true,
            message:
                "The specified recipient is already a member of this household",
        });
    }

    // Populate the main body of the email
    var emailBody = "";
    emailBody += "Greetings,\n\n";
    emailBody +=
        "This is an email to notify you that " +
        req.user.name +
        ' has invited you to join the "' +
        req.household.name +
        '" household on HouseholdHQ.\n\n';

    if (existingUser) {
        // Check if the recipient already has a household
        if (existingUser.householdID) {
            emailBody +=
                "If you wish to join this household, you must leave your current household (from the Household Info page), and then use the following identifier on the Join Household page during your next login: " +
                req.household._id.toString() +
                "\n\n";
        } else {
            emailBody +=
                "To become a member of this household, simply login and use the following identifier on the Join Household page: " +
                req.household._id.toString() +
                "\n\n";
        }
    } else {
        emailBody +=
            "To become a member of this household, simply create an account and use the following identifier on the Join Household page: " +
            req.household._id.toString() +
            "\n\n";
    }

    emailBody +=
        "Access the application using the following address: https://householdhq.up.railway.app/\n\nKind Regards,\n\nHouseholdHQ";

    // Send an email to the new user
    const mailOptions = {
        to: req.body.email,
        subject: "HouseholdHQ Invitiation from " + req.user.name,
        text: emailBody,
    };

    // Attempt to send the email
    try {
        await transporter.sendMail(mailOptions);

        res.send({
            error: false,
            message: "An invitation was successfully sent",
        });
    } catch (emailError) {
        res.statusCode = 400;
        res.type("json");
        return res.json({
            error: true,
            message: "The invitiation request failed",
        });
    }
});

// Update household chores list endpoint
router.patch("/chores", verify, async (req, res) => {
    // Validation
    if (!req.household) {
        res.statusCode = 400;
        res.type("json");
        return res.json({
            error: true,
            message: "The specified user does not belong to a household",
        });
    }

    const updatedChoresList = req.body.chores;

    if (!updatedChoresList) {
        res.statusCode = 400;
        res.type("json");
        return res.json({
            error: true,
            message: "A list of chores must be provided",
        });
    }

    if (!Array.isArray(updatedChoresList)) {
        res.statusCode = 400;
        res.type("json");
        return res.json({
            error: true,
            message: "'chores' parameter must be an array",
        });
    }

    if (updatedChoresList.length !== req.household.chores.length) {
        res.statusCode = 400;
        res.type("json");
        return res.json({
            error: true,
            message:
                "'chores' parameter must be the same length as the household chores list",
        });
    }

    for (var i = 0; i < updatedChoresList.length; i++) {
        if (!ObjectId.isValid(updatedChoresList[i])) {
            res.statusCode = 400;
            res.type("json");
            return res.json({
                error: true,
                message: "An invalid chore ID was specified",
            });
        }

        if (!req.household.chores.includes(updatedChoresList[i])) {
            res.statusCode = 400;
            res.type("json");
            return res.json({
                error: true,
                message: "An unexpected chore ID was specified",
            });
        }
    }

    // Update the household chores list
    update = { chores: updatedChoresList };
    await Household.findByIdAndUpdate(req.household._id, update);

    // Emit a socket evvent
    if (process.env.NODE_ENV !== "test") {
        const io = req.app.get("socketio");
        io.to(req.household._id.toString()).emit("chores-list-updated");
    }

    res.send({ chores: updatedChoresList });
});

// Update profile photo endpoint
router.patch("/profile/photo", verify, async (req, res) => {
    // Validation
    if (!req.household) {
        res.statusCode = 400;
        res.type("json");
        return res.json({
            error: true,
            message: "The specified user does not belong to a household",
        });
    }

    var newProfilePhoto = req.body.profilePhoto;

    if (!newProfilePhoto) {
        res.statusCode = 400;
        res.type("json");
        return res.json({
            error: true,
            message: "A profile photo selection must be provided",
        });
    }

    if (isNaN(newProfilePhoto)) {
        res.statusCode = 400;
        res.type("json");
        return res.json({
            error: true,
            message: "Profile photo selection is invalid",
        });
    }

    newProfilePhoto = parseInt(newProfilePhoto);

    if (newProfilePhoto < -1 || newProfilePhoto > 53) {
        res.statusCode = 400;
        res.type("json");
        return res.json({
            error: true,
            message: "Profile photo selection is out of range",
        });
    }

    // Update the user's profile photo
    update = { profilePhoto: newProfilePhoto };
    await User.findByIdAndUpdate(req.user._id, update);

    // Emit a socket event
    if (process.env.NODE_ENV !== "test") {
        const io = req.app.get("socketio");
        io.to(req.household._id.toString()).emit("profile-photo-updated");
    }

    res.send({ error: false, message: "Profile photo successfully updated" });
});

module.exports = router;
