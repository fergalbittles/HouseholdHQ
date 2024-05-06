const {
    createHouseholdValidation,
    inviteValidation,
} = require("../../routes/validation/householdValidation");

// Test the create household validation with successful requests
describe("Successful create household validation tests", () => {
    test("A successful attempt to validate the schema", async () => {
        const body = {
            name: "John Doe",
        };

        const { error } = createHouseholdValidation(body);

        expect(error).toBeUndefined();
    });
});

// Test the create household validation with failed requests
describe("Failed create household validation tests", () => {
    test("A failed attempt to validate the schema due to missing name parameter", async () => {
        const body = {};

        const { error } = createHouseholdValidation(body);

        expect(error.details[0].message).toEqual('"name" is required');
    });

    test("A failed attempt to validate the schema due to invalid name parameter", async () => {
        const body = {
            name: "Joe",
        };

        const { error } = createHouseholdValidation(body);

        expect(error.details[0].message).toEqual(
            '"name" length must be at least 6 characters long'
        );
    });

    test("A failed attempt to validate the schema due to unknown parameter", async () => {
        const body = {
            name: "Joe McKnight",
            age: 43,
        };

        const { error } = createHouseholdValidation(body);

        expect(error.details[0].message).toEqual('"age" is not allowed');
    });
});

// Test the invite validation with successful requests
describe("Successful invite validation tests", () => {
    test("A successful attempt to validate the schema", async () => {
        const body = {
            email: "john.doe@gmail.com",
        };

        const { error } = inviteValidation(body);

        expect(error).toBeUndefined();
    });
});

// Test the invite validation with failed requests
describe("Failed invite validation tests", () => {
    test("A failed attempt to validate the schema due to missing email parameter", async () => {
        const body = {};

        const { error } = inviteValidation(body);

        expect(error.details[0].message).toEqual('"email" is required');
    });

    test("A failed attempt to validate the schema due to invalid email parameter", async () => {
        const body = {
            name: "john.doe.123",
        };

        const { error } = inviteValidation(body);

        expect(error.details[0].message).toEqual('"email" is required');
    });

    test("A failed attempt to validate the schema due to an email parameter which is too short", async () => {
        const body = {
            email: "j@d.c",
        };

        const { error } = inviteValidation(body);

        expect(error.details[0].message).toEqual(
            '"email" length must be at least 6 characters long'
        );
    });

    test("A failed attempt to validate the schema due to unknown parameter", async () => {
        const body = {
            email: "john.doe@gmail.com",
            age: 43,
        };

        const { error } = inviteValidation(body);

        expect(error.details[0].message).toEqual('"age" is not allowed');
    });
});
