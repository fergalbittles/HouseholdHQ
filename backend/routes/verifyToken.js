const User = require("../model/User");
const Household = require("../model/Household");
const jwt = require("jsonwebtoken");

module.exports = async function (req, res, next) {
    const token = req.header("auth-token");

    if (!token) {
        res.statusCode = 401;
        res.type("json");
        return res.json({ message: "Access Denied" });
    }

    try {
        const verified = jwt.verify(token, process.env.TOKEN_SECRET);
        req.user = verified;
    } catch (err) {
        res.statusCode = 400;
        res.type("json");
        return res.json({ message: "Invalid Token" });
    }

    // Ensure the user still exists
    const existingUser = await User.findOne({ _id: req.user._id });

    if (!existingUser) {
        res.statusCode = 401;
        res.type("json");
        return res.json({ error: true, message: "User no longer exists" });
    }

    // Append household information to the request body
    if (existingUser.householdID) {
        const userHousehold = await Household.findOne({
            _id: existingUser.householdID,
        });
        req.household = userHousehold;
    }

    req.user = existingUser;
    next();
};
