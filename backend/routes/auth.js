const router = require("express").Router();
const User = require("../model/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const verify = require("./verifyToken");
const {
    registerValidation,
    loginValidation,
} = require("./validation/authValidation");
const { transporter } = require("../util/transporter");

// Get user info using an auth token
router.get("/", verify, async (req, res) => {
    const user = {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        householdId: req.user.householdID,
        notifications: req.user.notifications,
        profilePhoto: req.user.profilePhoto,
    };

    res.send({ user: user });
});

// Register endpoint
router.post("/register", async (req, res) => {
    // Sanitise input
    if (req?.body?.email) {
        req.body.email = req.body.email.trim().toLowerCase();
    }

    if (req?.body?.name) {
        req.body.name = req.body.name.trim().toLowerCase();
        const strArray = req.body.name.split(" ");

        for (let i = 0; i < strArray.length; i++) {
            strArray[i] =
                strArray[i].charAt(0).toUpperCase() + strArray[i].substring(1);
        }

        req.body.name = strArray.join(" ");
    }

    // Validation
    const { error } = registerValidation(req.body);

    if (error) {
        res.statusCode = 400;
        res.type("json");
        return res.json({ error: true, message: error.details[0].message });
    }

    // Check if the user already exists
    const emailExists = await User.findOne({ email: req.body.email });

    if (emailExists) {
        res.statusCode = 400;
        res.type("json");
        return res.json({
            error: true,
            message: "An account using this email address already exists",
        });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // Create new user
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
    });

    // Save new user
    try {
        const savedUser = await user.save();

        // Send an email to the new user
        const mailOptions = {
            to: req.body.email,
            subject: "New HouseholdHQ Account",
            text:
                "Greetings " +
                req.body.name +
                ",\n\nThis is an email to notify you that a HouseholdHQ account has been created using your email address.\n\nLogin to your account using the following address: https://householdhq.up.railway.app/\n\nEnjoy the application!",
        };

        // Attempt to send the email
        try {
            await transporter.sendMail(mailOptions);
        } catch (emailError) {}

        // Create and assign a jwt token
        const token = jwt.sign(
            { _id: savedUser._id },
            process.env.TOKEN_SECRET
        );
        res.header("auth-token", token).send({
            user: savedUser._id,
            household: savedUser.householdID,
        });
    } catch (err) {
        res.statusCode = 400;
        res.type("json");
        return res.json({ error: true, message: err?.message });
    }
});

// Login endpoint
router.post("/login", async (req, res) => {
    // Sanitise input
    if (req?.body?.email) {
        req.body.email = req.body.email.trim().toLowerCase();
    }

    // Validation
    const { error } = loginValidation(req.body);

    if (error) {
        res.statusCode = 400;
        res.type("json");
        return res.json({ error: true, message: error.details[0].message });
    }

    // Check if the user exists
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        res.statusCode = 400;
        res.type("json");
        return res.json({
            error: true,
            message: "Email address or password is incorrect",
        });
    }

    // Check if password is correct
    const validPassword = await bcrypt.compare(
        req.body.password,
        user.password
    );

    if (!validPassword) {
        res.statusCode = 400;
        res.type("json");
        return res.json({
            error: true,
            message: "Email address or password is incorrect",
        });
    }

    // Create and assign a jwt token
    const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET);
    res.header("auth-token", token).send({ household: user.householdID });
});

module.exports = router;
