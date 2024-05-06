const router = require("express").Router();
const verify = require("./verifyToken");
const User = require("../model/User");
const Notification = require("../model/Notification");
const ObjectId = require("mongoose").Types.ObjectId;

// Get all notifications
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

    var notificationsResponse = [];

    if (req.user.notifications.length > 0) {
        notificationsResponse = await Notification.find({
            _id: { $in: req.user.notifications },
        });
    }

    res.send({ notifications: notificationsResponse });
});

// Delete all notifications
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

    if (req.user.notifications.length < 1) {
        res.statusCode = 400;
        res.type("json");
        return res.json({
            error: true,
            message: "The specified user does not have any notifications",
        });
    }

    // Delete the notifications
    try {
        await User.findByIdAndUpdate(req.user._id, { notifications: [] });
    } catch (err) {
        res.statusCode = 400;
        res.type("json");
        return res.json({ error: true, message: err?.message });
    }

    res.send({ error: false, message: "Notifications deleted successfully" });
});

// Mark notification as read
router.patch("/read", verify, async (req, res) => {
    // Validation
    if (!req.household) {
        res.statusCode = 400;
        res.type("json");
        return res.json({
            error: true,
            message: "The specified user does not belong to a household",
        });
    }

    if (req.user.notifications.length < 1) {
        res.statusCode = 400;
        res.type("json");
        return res.json({
            error: true,
            message: "The specified user does not have any notifications",
        });
    }

    var notificationId = req.body.notificationId;

    if (!notificationId) {
        res.statusCode = 400;
        res.type("json");
        return res.json({
            error: true,
            message: "A notification ID was not provided",
        });
    }

    if (!ObjectId.isValid(notificationId)) {
        res.statusCode = 400;
        res.type("json");
        return res.json({
            error: true,
            message: "The provided notification ID is invalid",
        });
    }

    // Check if the notification exists
    const existingNotification = await Notification.findOne({
        _id: notificationId,
    });

    if (!existingNotification) {
        res.statusCode = 400;
        res.type("json");
        return res.json({
            error: true,
            message: "The specified notification does not exist",
        });
    }

    // Check if the notification has already been read
    if (existingNotification.isRead.includes(req.user._id)) {
        res.statusCode = 400;
        res.type("json");
        return res.json({
            error: true,
            message: "The specified notification has already been read",
        });
    }

    // Check if the notification belongs to the user
    if (!req.user.notifications.includes(notificationId)) {
        res.statusCode = 400;
        res.type("json");
        return res.json({
            error: true,
            message:
                "The specified notification does not belong to the specified user",
        });
    }

    // Update the notification
    existingNotification.isRead.push(req.user._id);

    var update = {
        isRead: existingNotification.isRead,
    };
    const updatedNotification = await Notification.findByIdAndUpdate(
        notificationId,
        update,
        {
            new: true,
        }
    );

    var notificationsResponse = [];

    if (req.user.notifications.length > 0) {
        notificationsResponse = await Notification.find({
            _id: { $in: req.user.notifications },
        });
    }

    res.send({ notifications: notificationsResponse });
});

// Show support on a notification
router.patch("/support", verify, async (req, res) => {
    // Validation
    if (!req.household) {
        res.statusCode = 400;
        res.type("json");
        return res.json({
            error: true,
            message: "The specified user does not belong to a household",
        });
    }

    if (req.user.notifications.length < 1) {
        res.statusCode = 400;
        res.type("json");
        return res.json({
            error: true,
            message: "The specified user does not have any notifications",
        });
    }

    var notificationId = req.body.notificationId;

    if (!notificationId) {
        res.statusCode = 400;
        res.type("json");
        return res.json({
            error: true,
            message: "A notification ID was not provided",
        });
    }

    if (!ObjectId.isValid(notificationId)) {
        res.statusCode = 400;
        res.type("json");
        return res.json({
            error: true,
            message: "The provided notification ID is invalid",
        });
    }

    // Check if the notification exists
    const existingNotification = await Notification.findOne({
        _id: notificationId,
    });

    if (!existingNotification) {
        res.statusCode = 400;
        res.type("json");
        return res.json({
            error: true,
            message: "The specified notification does not exist",
        });
    }

    // Check if the notification belongs to the user
    if (!req.user.notifications.includes(notificationId)) {
        res.statusCode = 400;
        res.type("json");
        return res.json({
            error: true,
            message:
                "The specified notification does not belong to the specified user",
        });
    }

    // Check if the notification is the correct type
    if (existingNotification.notificationType !== "decline-chore-assignment") {
        res.statusCode = 400;
        res.type("json");
        return res.json({
            error: true,
            message: "Cannot show support for this type of notificaiton",
        });
    }

    // Check if this user has already supported this notification
    if (existingNotification.supportingUsers.includes(req.user._id)) {
        res.statusCode = 400;
        res.type("json");
        return res.json({
            error: true,
            message:
                "Cannot show support more than once for the same notification",
        });
    }

    // Check if the user is supporting their own decision
    if (existingNotification.userID.toString() === req.user._id.toString()) {
        res.statusCode = 400;
        res.type("json");
        return res.json({
            error: true,
            message: "Cannot show support for your own chore decline",
        });
    }

    // Update the notification
    existingNotification.supportingUsers.push(req.user._id);

    var update = {
        numOfSupporters: existingNotification.numOfSupporters + 1,
        supportingUsers: existingNotification.supportingUsers,
    };
    const updatedNotification = await Notification.findByIdAndUpdate(
        notificationId,
        update,
        {
            new: true,
        }
    );

    var notificationsResponse = [];

    if (req.user.notifications.length > 0) {
        notificationsResponse = await Notification.find({
            _id: { $in: req.user.notifications },
        });
    }

    // Emit a socket event
    if (process.env.NODE_ENV !== "test") {
        const io = req.app.get("socketio");
        io.to(req.household._id.toString()).emit("notification-supported");
    }

    res.send({ notifications: notificationsResponse });
});

module.exports = router;
