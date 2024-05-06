const {
    createChoreValidation,
    updateChoreValidation,
} = require("../../routes/validation/choreValidation");

// Test the create chore validation with successful requests
describe("Successful create chore validation tests", () => {
    test("A successful attempt to validate the schema", async () => {
        const body = {
            title: "Wash the dishes",
        };

        const { error } = createChoreValidation(body);

        expect(error).toBeUndefined();
    });
});

// Test the create chore validation with failed requests
describe("Failed create chore validation tests", () => {
    test("A failed attempt to validate the schema due to missing parameter", async () => {
        const body = {};

        const { error } = createChoreValidation(body);

        expect(error.details[0].message).toEqual('"title" is required');
    });

    test("A failed attempt to validate the schema due to invalid parameter", async () => {
        const body = {
            title: "H",
        };

        const { error } = createChoreValidation(body);

        expect(error.details[0].message).toEqual(
            '"title" length must be at least 2 characters long'
        );
    });

    test("A failed attempt to validate the schema due to unknown parameter", async () => {
        const body = {
            title: "Wash the dishes",
            priority: "High",
        };

        const { error } = createChoreValidation(body);

        expect(error.details[0].message).toEqual('"priority" is not allowed');
    });
});

// Test the update chore validation with successful requests
describe("Successful update chore validation tests", () => {
    test("A successful attempt to validate the schema", async () => {
        const body = {
            description: "It is very important for the dishes to be washed!",
            priority: "High",
        };

        const { error } = updateChoreValidation(body);

        expect(error).toBeUndefined();
    });
});

// Test the update chore validation with failed requests
describe("Failed update chore validation tests", () => {
    test("A failed attempt to validate the schema due to invalid parameter", async () => {
        const body = {
            description: "It is very important for the dishes to be washed!",
            priority: "Ultra High!",
        };

        const { error } = updateChoreValidation(body);

        expect(error.details[0].message).toEqual(
            '"priority" must be one of [None, Low, Medium, High]'
        );
    });

    test("A failed attempt to validate the schema due to unknown parameter", async () => {
        const body = {
            description: "It is very important for the dishes to be washed!",
            priority: "High",
            person: "Jeff",
        };

        const { error } = updateChoreValidation(body);

        expect(error.details[0].message).toEqual('"person" is not allowed');
    });
});
