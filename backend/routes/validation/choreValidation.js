// Validation
const Joi = require("@hapi/joi");

// Create chore validation
const createChoreValidation = (data) => {
    const schema = Joi.object({
        title: Joi.string().min(2).max(255).required(),
    });

    return schema.validate(data);
};

// Get todays date
var today = Date.now();
today = new Date(today);
today.setHours(0, 0, 0, 0);

// Update chore validation
const updateChoreValidation = (data) => {
    const schema = Joi.object({
        title: Joi.string().min(2).max(255),
        description: Joi.string().max(2000).allow(null, ""),
        priority: Joi.string()
            .min(3)
            .max(10)
            .valid("None", "Low", "Medium", "High"),
        dateDue: Joi.date().min(today),
        choreId: Joi.string().min(6),
    });

    return schema.validate(data);
};

module.exports.createChoreValidation = createChoreValidation;
module.exports.updateChoreValidation = updateChoreValidation;
