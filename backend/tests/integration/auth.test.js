const request = require("supertest");
const server = require("../../index");
const mongoose = require("mongoose");
const User = require("../../model/User");
const Household = require("../../model/Household");
const { transporter } = require("../../util/transporter");

// Mock database queries
const findOneHousehold = jest.spyOn(Household, "findOne");
const findOneUser = jest.spyOn(User, "findOne");
const saveUser = jest.spyOn(User.prototype, "save");
const sendMail = jest.spyOn(transporter, "sendMail");

// Open database connection before each test
beforeAll(() => {
    mongoose.connect(process.env.DB_CONNECT);
});

// Close database connection after all tests
afterAll(async () => {
    await findOneHousehold.mockRestore();
    await findOneUser.mockRestore();
    await saveUser.mockRestore();
    await sendMail.mockRestore();
    await mongoose.connection.close();
});

// Test the login endpoint with successful requests
describe("Successful login endpoint tests", () => {
    test("A successful login attempt where the user does not belong to a household", async () => {
        findOneUser.mockImplementation(() =>
            Promise.resolve({
                _id: "63adcff10e718f3a3e7e65b9",
                email: "joebloggs@email.com",
                password:
                    "$2a$10$uxdgbAZ0qu5oA1W574etDeGWukVsrOLCkZc0e/IFaronBO3gtBBza",
                householdID: null,
            })
        );

        const response = await request(server).post("/api/user/login").send({
            email: "joebloggs@email.com",
            password: "password",
        });

        expect(response.statusCode).toBe(200);
        expect(response.headers["auth-token"]).toBeDefined();
        expect(response.body).toEqual({ household: null });
    });

    test("A successful login attempt where the user belongs to a household", async () => {
        findOneUser.mockImplementation(() =>
            Promise.resolve({
                _id: "63adcff10e718f3a3e7e65b9",
                email: "joebloggs@email.com",
                password:
                    "$2a$10$uxdgbAZ0qu5oA1W574etDeGWukVsrOLCkZc0e/IFaronBO3gtBBza",
                householdID: "63add0100e718f3a3e7e65bc",
            })
        );

        const response = await request(server).post("/api/user/login").send({
            email: "joebloggs@email.com",
            password: "password",
        });

        expect(response.statusCode).toBe(200);
        expect(response.headers["auth-token"]).toBeDefined();
        expect(response.body).toEqual({
            household: "63add0100e718f3a3e7e65bc",
        });
    });
});

// Test the login endpoint with failed requests
describe("Failed login endpoint tests", () => {
    test("A failed login attempt due to missing request body", async () => {
        const response = await request(server).post("/api/user/login");

        expect(response.statusCode).toBe(400);
        expect(response.headers["auth-token"]).toBeUndefined();
        expect(response.body).toEqual({
            error: true,
            message: '"email" is required',
        });
    });

    test("A failed login attempt due to invalid email address", async () => {
        const response = await request(server).post("/api/user/login").send({
            email: "joebloggs",
            password: "password",
        });

        expect(response.statusCode).toBe(400);
        expect(response.headers["auth-token"]).toBeUndefined();
        expect(response.body).toEqual({
            error: true,
            message: '"email" must be a valid email',
        });
    });

    test("A failed login attempt due to password which is too short", async () => {
        const response = await request(server).post("/api/user/login").send({
            email: "joebloggs@email.com",
            password: "pas",
        });

        expect(response.statusCode).toBe(400);
        expect(response.headers["auth-token"]).toBeUndefined();
        expect(response.body).toEqual({
            error: true,
            message: '"password" length must be at least 6 characters long',
        });
    });

    test("A failed login attempt due to invalid password", async () => {
        findOneUser.mockImplementation(() =>
            Promise.resolve({
                _id: "63adcff10e718f3a3e7e65b9",
                email: "joe.bloggs@email.com",
                password:
                    "$2a$10$uxdgbAZ0qu5oA1W574etDeGWukVsrOLCkZc0e/IFaronBO3gtBBza",
                householdID: null,
            })
        );

        const response = await request(server).post("/api/user/login").send({
            email: "joe.bloggs@email.com",
            password: "wrong_password",
        });

        expect(response.statusCode).toBe(400);
        expect(response.headers["auth-token"]).toBeUndefined();
        expect(response.body).toEqual({
            error: true,
            message: "Email address or password is incorrect",
        });
    });

    test("A failed login attempt due to incorrect credentials", async () => {
        findOneUser.mockImplementation(() => Promise.resolve(null));

        const response = await request(server).post("/api/user/login").send({
            email: "jenny.wright@email.com",
            password: "password",
        });

        expect(response.statusCode).toBe(400);
        expect(response.headers["auth-token"]).toBeUndefined();
        expect(response.body).toEqual({
            error: true,
            message: "Email address or password is incorrect",
        });
    });
});

// Test the register endpoint with successful requests
describe("Successful register endpoint tests", () => {
    test("A successful register attempt", async () => {
        findOneUser.mockImplementation(() => Promise.resolve(null));
        saveUser.mockImplementation(() =>
            Promise.resolve({
                _id: "63adcff10e718f3a3e7e65b9",
                householdID: null,
            })
        );
        sendMail.mockImplementation(() => Promise.resolve(true));

        const response = await request(server).post("/api/user/register").send({
            name: "Jenny Wright",
            email: "jenny.wright@email.com",
            password: "password",
        });

        expect(response.statusCode).toBe(200);
        expect(response.headers["auth-token"]).toBeDefined();
        expect(response.body).toEqual({
            user: "63adcff10e718f3a3e7e65b9",
            household: null,
        });
    });

    test("A successful register with an unsuccessful email attempt", async () => {
        findOneUser.mockImplementation(() => Promise.resolve(null));
        saveUser.mockImplementation(() =>
            Promise.resolve({
                _id: "63adcff10e718f3a3e7e65b9",
                householdID: null,
            })
        );
        sendMail.mockImplementation(() => {
            throw new Error("Something went wrong");
        });

        const response = await request(server).post("/api/user/register").send({
            name: "Jenny Wright",
            email: "jenny.wright@email.com",
            password: "password",
        });

        expect(response.statusCode).toBe(200);
        expect(response.headers["auth-token"]).toBeDefined();
        expect(response.body).toEqual({
            user: "63adcff10e718f3a3e7e65b9",
            household: null,
        });
    });
});

// Test the register endpoint with failed requests
describe("Failed register endpoint tests", () => {
    test("A failed register attempt due to user email already existing", async () => {
        findOneUser.mockImplementation(() =>
            Promise.resolve({
                _id: "63adcff10e718f3a3e7e65b9",
                email: "jenny.wright@email.com",
                password:
                    "$2a$10$uxdgbAZ0qu5oA1W574etDeGWukVsrOLCkZc0e/IFaronBO3gtBBza",
                householdID: null,
            })
        );

        const response = await request(server).post("/api/user/register").send({
            name: "Jenny Wright",
            email: "jenny.wright@email.com",
            password: "password",
        });

        expect(response.statusCode).toBe(400);
        expect(response.headers["auth-token"]).toBeUndefined();
        expect(response.body).toEqual({
            error: true,
            message: "An account using this email address already exists",
        });
    });

    test("A failed register attempt due to a missing name parameter", async () => {
        const response = await request(server).post("/api/user/register").send({
            email: "jenny.wright@email.com",
            password: "password",
        });

        expect(response.statusCode).toBe(400);
        expect(response.headers["auth-token"]).toBeUndefined();
        expect(response.body).toEqual({
            error: true,
            message: '"name" is required',
        });
    });

    test("A failed register attempt due to a missing email parameter", async () => {
        const response = await request(server).post("/api/user/register").send({
            name: "Jenny Wright",
            password: "password",
        });

        expect(response.statusCode).toBe(400);
        expect(response.headers["auth-token"]).toBeUndefined();
        expect(response.body).toEqual({
            error: true,
            message: '"email" is required',
        });
    });

    test("A failed register attempt due to an invalid parameter", async () => {
        const response = await request(server).post("/api/user/register").send({
            name: "Jenny Wright",
            email: "j@e.c",
            password: "password",
        });

        expect(response.statusCode).toBe(400);
        expect(response.headers["auth-token"]).toBeUndefined();
        expect(response.body).toEqual({
            error: true,
            message: '"email" length must be at least 6 characters long',
        });
    });

    test("A failed register attempt due to error during save operation", async () => {
        findOneUser.mockImplementation(() => Promise.resolve(null));
        saveUser.mockImplementation(() => {
            throw new Error("Something went wrong");
        });

        const response = await request(server).post("/api/user/register").send({
            name: "Jenny Wright",
            email: "jenny.wright@email.com",
            password: "password",
        });

        expect(response.statusCode).toBe(400);
        expect(response.headers["auth-token"]).toBeUndefined();
        expect(response.body).toEqual({
            error: true,
            message: "Something went wrong",
        });
    });
});

// Test the get user endpoint with successful requests
describe("Successful get user endpoint tests", () => {
    test("A successful get user attempt where the user does not belong to a household", async () => {
        findOneUser.mockImplementation(() =>
            Promise.resolve({
                _id: "63adcff10e718f3a3e7e65b9",
                email: "jenny.wright@email.com",
                password:
                    "$2a$10$uxdgbAZ0qu5oA1W574etDeGWukVsrOLCkZc0e/IFaronBO3gtBBza",
                householdID: null,
                name: "Jenny Wright",
                date: "2022-12-30T14:00:28.108Z",
                notifications: [],
                profilePhoto: -1,
            })
        );

        const response = await request(server)
            .get("/api/user")
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(200);
        expect(response.headers["auth-token"]).toBeUndefined();
        expect(response.body).toEqual({
            user: {
                email: "jenny.wright@email.com",
                householdId: null,
                id: "63adcff10e718f3a3e7e65b9",
                name: "Jenny Wright",
                notifications: [],
                profilePhoto: -1,
            },
        });
    });

    test("A successful get user attempt where the user belongs to a household", async () => {
        findOneUser.mockImplementation(() =>
            Promise.resolve({
                _id: "63adcff10e718f3a3e7e65b9",
                email: "jenny.wright@email.com",
                password:
                    "$2a$10$uxdgbAZ0qu5oA1W574etDeGWukVsrOLCkZc0e/IFaronBO3gtBBza",
                householdID: "63adcff10e728f3a3e5e65b7",
                name: "Jenny Wright",
                date: "2022-12-30T14:00:28.108Z",
                notifications: [],
                profilePhoto: 21,
            })
        );
        findOneHousehold.mockImplementation(() =>
            Promise.resolve({
                _id: "63adcff10e728f3a3e5e65b7",
            })
        );

        const response = await request(server)
            .get("/api/user")
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(200);
        expect(response.headers["auth-token"]).toBeUndefined();
        expect(response.body).toEqual({
            user: {
                email: "jenny.wright@email.com",
                householdId: "63adcff10e728f3a3e5e65b7",
                id: "63adcff10e718f3a3e7e65b9",
                name: "Jenny Wright",
                notifications: [],
                profilePhoto: 21,
            },
        });
    });
});

// Test the get user endpoint with failed requests
describe("Failed get user endpoint tests", () => {
    test("A failed get attempt due to no auth-token header", async () => {
        findOneUser.mockImplementation(() => Promise.resolve(null));

        const response = await request(server).get("/api/user");

        expect(response.statusCode).toBe(401);
        expect(response.headers["auth-token"]).toBeUndefined();
        expect(response.body).toEqual({
            message: "Access Denied",
        });
    });

    test("A failed get attempt due to invalid auth-token header", async () => {
        findOneUser.mockImplementation(() => Promise.resolve(null));

        const response = await request(server)
            .get("/api/user")
            .set("auth-token", "invalidtoken123345");

        expect(response.statusCode).toBe(400);
        expect(response.headers["auth-token"]).toBeUndefined();
        expect(response.body).toEqual({
            message: "Invalid Token",
        });
    });

    test("A failed get attempt due to user no longer existing", async () => {
        findOneUser.mockImplementation(() => Promise.resolve(null));

        const response = await request(server)
            .get("/api/user")
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(401);
        expect(response.headers["auth-token"]).toBeUndefined();
        expect(response.body).toEqual({
            error: true,
            message: "User no longer exists",
        });
    });
});
