const {
    registerValidation,
    loginValidation,
} = require("../../routes/validation/authValidation");

// Test the register validation with successful requests
describe("Successful register validation tests", () => {
    test("A successful attempt to validate the schema", async () => {
        const body = {
            name: "Joe Bloggs",
            email: "joebloggs@email.com",
            password: "password",
        };

        const { error } = registerValidation(body);

        expect(error).toBeUndefined();
    });
});

// Test the register validation with failed requests
describe("Failed register validation tests", () => {
    test("A failed attempt to validate the schema due to missing parameter", async () => {
        const body = {
            email: "joebloggs@email.com",
            password: "password",
        };

        const { error } = registerValidation(body);

        expect(error.details[0].message).toEqual('"name" is required');
    });

    test("A failed attempt to validate the schema due to invalid parameter", async () => {
        const body = {
            name: "Joe Bloggs",
            email: "joe.bloggs",
            password: "password",
        };

        const { error } = registerValidation(body);

        expect(error.details[0].message).toEqual(
            '"email" must be a valid email'
        );
    });

    test("A failed attempt to validate the schema due to unknown parameter", async () => {
        const body = {
            name: "Joe Bloggs",
            email: "joebloggs@email.com",
            password: "password",
            age: 43,
        };

        const { error } = registerValidation(body);

        expect(error.details[0].message).toEqual('"age" is not allowed');
    });
});

// Test the login validation with successful requests
describe("Successful login validation tests", () => {
    test("A successful attempt to validate the schema", async () => {
        const body = {
            email: "joebloggs@email.com",
            password: "password",
        };

        const { error } = loginValidation(body);

        expect(error).toBeUndefined();
    });
});

// Test the login validation with failed requests
describe("Failed login validation tests", () => {
    test("A failed attempt to validate the schema due to missing parameter", async () => {
        const body = {
            email: "joebloggs@email.com",
        };

        const { error } = loginValidation(body);

        expect(error.details[0].message).toEqual('"password" is required');
    });

    test("A failed attempt to validate the schema due to invalid parameter", async () => {
        const body = {
            email: "joebloggs.com",
            password: "password",
        };

        const { error } = loginValidation(body);

        expect(error.details[0].message).toEqual(
            '"email" must be a valid email'
        );
    });

    test("A failed attempt to validate the schema due to unknown parameter", async () => {
        const body = {
            age: 43,
            email: "joebloggs@email.com",
            password: "password",
        };

        const { error } = loginValidation(body);

        expect(error.details[0].message).toEqual('"age" is not allowed');
    });
});
