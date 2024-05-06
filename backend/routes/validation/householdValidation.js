// Validation
const Joi = require("@hapi/joi");

// Create household validation
const createHouseholdValidation = (data) => {
    const schema = Joi.object({
        name: Joi.string().min(6).required(),
    });

    return schema.validate(data);
};

// Invite validation
const inviteValidation = (data) => {
    const schema = Joi.object({
        email: Joi.string().min(6).required().email(),
    });

    return schema.validate(data);
};

module.exports.createHouseholdValidation = createHouseholdValidation;
module.exports.inviteValidation = inviteValidation;
