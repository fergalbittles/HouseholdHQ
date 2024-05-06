const request = require("supertest");
const server = require("../../index");
const mongoose = require("mongoose");
const User = require("../../model/User");
const Household = require("../../model/Household");
const Notification = require("../../model/Notification");
const { transporter } = require("../../util/transporter");

// Mock database queries
const findOneUser = jest.spyOn(User, "findOne");
const findUser = jest.spyOn(User, "find");
const findUserByIdAndUpdate = jest.spyOn(User, "findByIdAndUpdate");
const updateManyUser = jest.spyOn(User, "updateMany");
const findOneHousehold = jest.spyOn(Household, "findOne");
const findHouseholdByIdAndUpdate = jest.spyOn(Household, "findByIdAndUpdate");
const saveHousehold = jest.spyOn(Household.prototype, "save");
const saveNotification = jest.spyOn(Notification.prototype, "save");
const sendMail = jest.spyOn(transporter, "sendMail");

// Open database connection before each test
beforeAll(() => {
    mongoose.connect(process.env.DB_CONNECT);
});

// Close database connection after all tests
afterAll(async () => {
    await findOneHousehold.mockRestore();
    await findOneUser.mockRestore();
    await findUser.mockRestore();
    await findUserByIdAndUpdate.mockRestore();
    await updateManyUser.mockRestore();
    await findHouseholdByIdAndUpdate.mockRestore();
    await saveHousehold.mockRestore();
    await saveNotification.mockRestore();
    await sendMail.mockRestore();
    await mongoose.connection.close();
});

// Test the create household endpoint with successful requests
describe("Successful create household endpoint tests", () => {
    test("A successful create household attempt", async () => {
        findOneUser.mockImplementation(() =>
            Promise.resolve({
                _id: "63adcff10e718f3a3e7e65b9",
                email: "jenny.wright@email.com",
                password:
                    "$2a$10$uxdgbAZ0qu5oA1W574etDeGWukVsrOLCkZc0e/IFaronBO3gtBBza",
                householdID: null,
                name: "Jenny Wright",
                date: "2022-12-30T14:00:28.108Z",
            })
        );
        findUserByIdAndUpdate.mockImplementation(() => Promise.resolve(true));
        saveHousehold.mockImplementation(() =>
            Promise.resolve({
                _id: "63adcff10e728f3a3e5e65b7",
            })
        );

        const response = await request(server)
            .post("/api/household/create")
            .send({
                name: "Flat 22B",
            })
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            householdId: "63adcff10e728f3a3e5e65b7",
        });
    });
});

// Test the create household endpoint with failed requests
describe("Failed create household endpoint tests", () => {
    test("A failed create household attempt due to user already belonging to a household", async () => {
        findOneUser.mockImplementation(() =>
            Promise.resolve({
                _id: "63adcff10e718f3a3e7e65b9",
                email: "jenny.wright@email.com",
                password:
                    "$2a$10$uxdgbAZ0qu5oA1W574etDeGWukVsrOLCkZc0e/IFaronBO3gtBBza",
                householdID: "63adcff10e728f3a3e5e65b7",
                name: "Jenny Wright",
                date: "2022-12-30T14:00:28.108Z",
            })
        );
        findOneHousehold.mockImplementation(() =>
            Promise.resolve({
                _id: "63adcff10e728f3a3e5e65b7",
            })
        );

        const response = await request(server)
            .post("/api/household/create")
            .send({
                name: "Flat 22B",
            })
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            error: true,
            message: "The specified user already belongs to a household",
        });
    });

    test("A failed create household attempt due to missing name parameter", async () => {
        findOneUser.mockImplementation(() =>
            Promise.resolve({
                _id: "63adcff10e718f3a3e7e65b9",
                email: "jenny.wright@email.com",
                password:
                    "$2a$10$uxdgbAZ0qu5oA1W574etDeGWukVsrOLCkZc0e/IFaronBO3gtBBza",
                householdID: null,
                name: "Jenny Wright",
                date: "2022-12-30T14:00:28.108Z",
            })
        );

        const response = await request(server)
            .post("/api/household/create")
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            error: true,
            message: '"name" is required',
        });
    });

    test("A failed create household attempt due to invalid name parameter", async () => {
        findOneUser.mockImplementation(() =>
            Promise.resolve({
                _id: "63adcff10e718f3a3e7e65b9",
                email: "jenny.wright@email.com",
                password:
                    "$2a$10$uxdgbAZ0qu5oA1W574etDeGWukVsrOLCkZc0e/IFaronBO3gtBBza",
                householdID: null,
                name: "Jenny Wright",
                date: "2022-12-30T14:00:28.108Z",
            })
        );

        const response = await request(server)
            .post("/api/household/create")
            .send({
                name: "Nope",
            })
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            error: true,
            message: '"name" length must be at least 6 characters long',
        });
    });

    test("A failed create household attempt due to missing auth token", async () => {
        const response = await request(server)
            .post("/api/household/create")
            .send({
                name: "Flat 22B",
            });

        expect(response.statusCode).toBe(401);
        expect(response.body).toEqual({
            message: "Access Denied",
        });
    });

    test("A failed create household attempt due to invalid auth token", async () => {
        const response = await request(server)
            .post("/api/household/create")
            .send({
                name: "Flat 22B",
            })
            .set("auth-token", "not-a-token");

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            message: "Invalid Token",
        });
    });

    test("A failed create household attempt due to an error occurring during the save household operation", async () => {
        findOneUser.mockImplementation(() =>
            Promise.resolve({
                _id: "63adcff10e718f3a3e7e65b9",
                email: "jenny.wright@email.com",
                password:
                    "$2a$10$uxdgbAZ0qu5oA1W574etDeGWukVsrOLCkZc0e/IFaronBO3gtBBza",
                householdID: null,
                name: "Jenny Wright",
                date: "2022-12-30T14:00:28.108Z",
            })
        );
        findUserByIdAndUpdate.mockImplementation(() => Promise.resolve(true));
        saveHousehold.mockImplementation(() => {
            throw new Error("Something went wrong");
        });

        const response = await request(server)
            .post("/api/household/create")
            .send({
                name: "Flat 22B",
            })
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            error: true,
            message: "Something went wrong",
        });
    });
});

// Test the join household endpoint with successful requests
describe("Successful join household endpoint tests", () => {
    test("A successful join household attempt", async () => {
        findOneUser.mockImplementation(() =>
            Promise.resolve({
                _id: "63adcff10e718f3a3e7e65b9",
                email: "jenny.wright@email.com",
                password:
                    "$2a$10$uxdgbAZ0qu5oA1W574etDeGWukVsrOLCkZc0e/IFaronBO3gtBBza",
                householdID: null,
                name: "Jenny Wright",
                date: "2022-12-30T14:00:28.108Z",
            })
        );
        findOneHousehold.mockImplementation(() =>
            Promise.resolve({
                _id: "63adcff10e728f3a3e5e65b7",
                members: [
                    "63b1ba6da2b164d686b35ae3",
                    "63b1ba96a2b164d686b35af8",
                ],
                choreAssignees: [
                    "63b1ba6da2b164d686b35ae3",
                    "63b1ba96a2b164d686b35af8",
                ],
            })
        );
        findHouseholdByIdAndUpdate.mockImplementation(() =>
            Promise.resolve({
                _id: "63adcff10e728f3a3e5e65b7",
                members: [
                    "63adcff10e718f3a3e7e65b9",
                    "63b1ba6da2b164d686b35ae3",
                    "63b1ba96a2b164d686b35af8",
                ],
            })
        );
        findUserByIdAndUpdate.mockImplementation(() => Promise.resolve(true));
        saveNotification.mockImplementation(() => Promise.resolve(true));
        updateManyUser.mockImplementation(() => Promise.resolve(true));

        const response = await request(server)
            .patch("/api/household/join")
            .send({
                householdId: "63adcff10e728f3a3e5e65b7",
            })
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            householdId: "63adcff10e728f3a3e5e65b7",
        });
    });
});

// Test the join household endpoint with failed requests
describe("Failed join household endpoint tests", () => {
    test("A failed join household attempt due to user already belonging to a household", async () => {
        findOneUser.mockImplementation(() =>
            Promise.resolve({
                _id: "63adcff10e718f3a3e7e65b9",
                email: "jenny.wright@email.com",
                password:
                    "$2a$10$uxdgbAZ0qu5oA1W574etDeGWukVsrOLCkZc0e/IFaronBO3gtBBza",
                householdID: "63adcff10e728f3a3e5e65b7",
                name: "Jenny Wright",
                date: "2022-12-30T14:00:28.108Z",
            })
        );
        findOneHousehold.mockImplementation(() =>
            Promise.resolve({
                _id: "63adcff10e728f3a3e5e65b7",
            })
        );

        const response = await request(server)
            .patch("/api/household/join")
            .send({
                householdId: "63adcff10e728f3a3e5e65b7",
            })
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            error: true,
            message: "The specified user already belongs to a household",
        });
    });

    test("A failed join household attempt due to missing ID parameter", async () => {
        findOneUser.mockImplementation(() =>
            Promise.resolve({
                _id: "63adcff10e718f3a3e7e65b9",
                email: "jenny.wright@email.com",
                password:
                    "$2a$10$uxdgbAZ0qu5oA1W574etDeGWukVsrOLCkZc0e/IFaronBO3gtBBza",
                householdID: null,
                name: "Jenny Wright",
                date: "2022-12-30T14:00:28.108Z",
            })
        );

        const response = await request(server)
            .patch("/api/household/join")
            .send({
                householdId: "",
            })
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            error: true,
            message: "A household ID was not provided",
        });
    });

    test("A failed join household attempt due to invalid ID parameter", async () => {
        findOneUser.mockImplementation(() =>
            Promise.resolve({
                _id: "63adcff10e718f3a3e7e65b9",
                email: "jenny.wright@email.com",
                password:
                    "$2a$10$uxdgbAZ0qu5oA1W574etDeGWukVsrOLCkZc0e/IFaronBO3gtBBza",
                householdID: null,
                name: "Jenny Wright",
                date: "2022-12-30T14:00:28.108Z",
            })
        );

        const response = await request(server)
            .patch("/api/household/join")
            .send({
                householdId: "invalid",
            })
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            error: true,
            message: "The provided household ID is invalid",
        });
    });

    test("A failed join household attempt due to household not existing", async () => {
        findOneUser.mockImplementation(() =>
            Promise.resolve({
                _id: "63adcff10e718f3a3e7e65b9",
                email: "jenny.wright@email.com",
                password:
                    "$2a$10$uxdgbAZ0qu5oA1W574etDeGWukVsrOLCkZc0e/IFaronBO3gtBBza",
                householdID: null,
                name: "Jenny Wright",
                date: "2022-12-30T14:00:28.108Z",
            })
        );
        findOneHousehold.mockImplementation(() => Promise.resolve(null));

        const response = await request(server)
            .patch("/api/household/join")
            .send({
                householdId: "63adcff10e728f3a3e5e65b7",
            })
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            error: true,
            message: "The specified household does not exist",
        });
    });

    test("A failed join household attempt due to household being full", async () => {
        findOneUser.mockImplementation(() =>
            Promise.resolve({
                _id: "63adcff10e718f3a3e7e65b9",
                email: "jenny.wright@email.com",
                password:
                    "$2a$10$uxdgbAZ0qu5oA1W574etDeGWukVsrOLCkZc0e/IFaronBO3gtBBza",
                householdID: null,
                name: "Jenny Wright",
                date: "2022-12-30T14:00:28.108Z",
            })
        );
        findOneHousehold.mockImplementation(() =>
            Promise.resolve({
                _id: "63adcff10e728f3a3e5e65b7",
                members: [
                    "63adcff10e718f3a3e7e65b9",
                    "63b1ba6da2b164d686b35ae3",
                    "63b1ba96a2b164d686b35af8",
                    "63adcff10e718f3a3e7e65b1",
                    "63b1ba6da2b164d686b35ae2",
                    "63b1ba96a2b164d686b35af4",
                    "63adcff10e718f3a3e7e65b5",
                    "63b1ba6da2b164d686b35ae6",
                    "63b1ba96a2b164d686b35af7",
                    "63adcff10e718f3a3e7e65b8",
                ],
            })
        );

        const response = await request(server)
            .patch("/api/household/join")
            .send({
                householdId: "63adcff10e728f3a3e5e65b7",
            })
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            error: true,
            message: "The specified household has reached capacity",
        });
    });

    test("A failed join household attempt due to missing auth token", async () => {
        const response = await request(server)
            .patch("/api/household/join")
            .send({
                householdId: "63adcff10e728f3a3e5e65b7",
            })
            .set("auth-token", "");

        expect(response.statusCode).toBe(401);
        expect(response.body).toEqual({
            message: "Access Denied",
        });
    });

    test("A failed join household attempt due to invalid auth token", async () => {
        const response = await request(server)
            .patch("/api/household/join")
            .send({
                householdId: "63adcff10e728f3a3e5e65b7",
            })
            .set("auth-token", "asldkfjnweo");

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            message: "Invalid Token",
        });
    });

    test("A failed join household attempt due to an error occurring during the save notification operation", async () => {
        findOneUser.mockImplementation(() =>
            Promise.resolve({
                _id: "63adcff10e718f3a3e7e65b9",
                email: "jenny.wright@email.com",
                password:
                    "$2a$10$uxdgbAZ0qu5oA1W574etDeGWukVsrOLCkZc0e/IFaronBO3gtBBza",
                householdID: null,
                name: "Jenny Wright",
                date: "2022-12-30T14:00:28.108Z",
            })
        );
        findOneHousehold.mockImplementation(() =>
            Promise.resolve({
                _id: "63adcff10e728f3a3e5e65b7",
                members: [
                    "63b1ba6da2b164d686b35ae3",
                    "63b1ba96a2b164d686b35af8",
                ],
                choreAssignees: [
                    "63b1ba6da2b164d686b35ae3",
                    "63b1ba96a2b164d686b35af8",
                ],
            })
        );
        findHouseholdByIdAndUpdate.mockImplementation(() =>
            Promise.resolve({
                _id: "63adcff10e728f3a3e5e65b7",
                members: [
                    "63adcff10e718f3a3e7e65b9",
                    "63b1ba6da2b164d686b35ae3",
                    "63b1ba96a2b164d686b35af8",
                ],
            })
        );
        findUserByIdAndUpdate.mockImplementation(() => Promise.resolve(true));
        saveNotification.mockImplementation(() => {
            throw new Error("Something went wrong");
        });

        const response = await request(server)
            .patch("/api/household/join")
            .send({
                householdId: "63adcff10e728f3a3e5e65b7",
            })
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            error: true,
            message: "Something went wrong",
        });
    });
});

// Test the get household endpoint with successful requests
describe("Successful get household endpoint tests", () => {
    test("A successful get household attempt", async () => {
        findOneUser.mockImplementation(() =>
            Promise.resolve({
                _id: "63adcff10e718f3a3e7e65b9",
                email: "jenny.wright@email.com",
                password:
                    "$2a$10$uxdgbAZ0qu5oA1W574etDeGWukVsrOLCkZc0e/IFaronBO3gtBBza",
                householdID: "63adcff10e728f3a3e5e65b7",
                name: "Jenny Wright",
                date: "2022-12-30T14:00:28.108Z",
            })
        );
        findOneHousehold.mockImplementation(() =>
            Promise.resolve({
                _id: "63adcff10e728f3a3e5e65b7",
                members: [
                    "63adcff10e718f3a3e7e65b9",
                    "63b1ba6da2b164d686b35ae3",
                    "63b1ba96a2b164d686b35af8",
                ],
            })
        );
        findUser.mockImplementation(() =>
            Promise.resolve([
                {
                    _id: "63adcff10e718f3a3e7e65b9",
                    name: "John Doe",
                },
                {
                    _id: "63b1ba6da2b164d686b35ae3",
                    name: "Rebecca McKnight",
                },
                {
                    _id: "63b1ba96a2b164d686b35af8",
                    name: "Joe Bloggs",
                },
            ])
        );

        const response = await request(server)
            .get("/api/household")
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            household: {
                _id: "63adcff10e728f3a3e5e65b7",
                completedChoreStreak: 0,
                members: [
                    {
                        _id: "63adcff10e718f3a3e7e65b9",
                        name: "John Doe",
                    },
                    {
                        _id: "63b1ba6da2b164d686b35ae3",
                        name: "Rebecca McKnight",
                    },
                    {
                        _id: "63b1ba96a2b164d686b35af8",
                        name: "Joe Bloggs",
                    },
                ],
            },
        });
    });

    test("A successful get household attempt where the completed chore streak is reset", async () => {
        findOneUser.mockImplementation(() =>
            Promise.resolve({
                _id: "63adcff10e718f3a3e7e65b9",
                email: "jenny.wright@email.com",
                password:
                    "$2a$10$uxdgbAZ0qu5oA1W574etDeGWukVsrOLCkZc0e/IFaronBO3gtBBza",
                householdID: "63adcff10e728f3a3e5e65b7",
                name: "Jenny Wright",
                date: "2022-12-30T14:00:28.108Z",
            })
        );
        findOneHousehold.mockImplementation(() =>
            Promise.resolve({
                _id: "63adcff10e728f3a3e5e65b7",
                members: [
                    "63adcff10e718f3a3e7e65b9",
                    "63b1ba6da2b164d686b35ae3",
                    "63b1ba96a2b164d686b35af8",
                ],
                lastCompletedChoreDate: "2023-01-23T13:32:41.676+00:00",
            })
        );
        findUser.mockImplementation(() =>
            Promise.resolve([
                {
                    _id: "63adcff10e718f3a3e7e65b9",
                    name: "John Doe",
                },
                {
                    _id: "63b1ba6da2b164d686b35ae3",
                    name: "Rebecca McKnight",
                },
                {
                    _id: "63b1ba96a2b164d686b35af8",
                    name: "Joe Bloggs",
                },
            ])
        );

        const response = await request(server)
            .get("/api/household")
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            household: {
                _id: "63adcff10e728f3a3e5e65b7",
                completedChoreStreak: 0,
                lastCompletedChoreDate: "2023-01-23T13:32:41.676+00:00",
                members: [
                    {
                        _id: "63adcff10e718f3a3e7e65b9",
                        name: "John Doe",
                    },
                    {
                        _id: "63b1ba6da2b164d686b35ae3",
                        name: "Rebecca McKnight",
                    },
                    {
                        _id: "63b1ba96a2b164d686b35af8",
                        name: "Joe Bloggs",
                    },
                ],
            },
        });
    });

    test("A successful get household attempt where the completed chore streak is persisted", async () => {
        // Get todays date
        var today = new Date(Date.now());
        today.setHours(0, 0, 0, 0);

        findOneUser.mockImplementation(() =>
            Promise.resolve({
                _id: "63adcff10e718f3a3e7e65b9",
                email: "jenny.wright@email.com",
                password:
                    "$2a$10$uxdgbAZ0qu5oA1W574etDeGWukVsrOLCkZc0e/IFaronBO3gtBBza",
                householdID: "63adcff10e728f3a3e5e65b7",
                name: "Jenny Wright",
                date: "2022-12-30T14:00:28.108Z",
            })
        );
        findOneHousehold.mockImplementation(() =>
            Promise.resolve({
                _id: "63adcff10e728f3a3e5e65b7",
                members: [
                    "63adcff10e718f3a3e7e65b9",
                    "63b1ba6da2b164d686b35ae3",
                    "63b1ba96a2b164d686b35af8",
                ],
                completedChoreStreak: 11,
                lastCompletedChoreDate: today.toString(),
            })
        );
        findUser.mockImplementation(() =>
            Promise.resolve([
                {
                    _id: "63adcff10e718f3a3e7e65b9",
                    name: "John Doe",
                },
                {
                    _id: "63b1ba6da2b164d686b35ae3",
                    name: "Rebecca McKnight",
                },
                {
                    _id: "63b1ba96a2b164d686b35af8",
                    name: "Joe Bloggs",
                },
            ])
        );

        const response = await request(server)
            .get("/api/household")
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            household: {
                _id: "63adcff10e728f3a3e5e65b7",
                completedChoreStreak: 11,
                lastCompletedChoreDate: today.toString(),
                members: [
                    {
                        _id: "63adcff10e718f3a3e7e65b9",
                        name: "John Doe",
                    },
                    {
                        _id: "63b1ba6da2b164d686b35ae3",
                        name: "Rebecca McKnight",
                    },
                    {
                        _id: "63b1ba96a2b164d686b35af8",
                        name: "Joe Bloggs",
                    },
                ],
            },
        });
    });
});

// Test the get household endpoint with failed requests
describe("Failed get household endpoint tests", () => {
    test("A failed get household attempt due to user not belonging to a household", async () => {
        findOneUser.mockImplementation(() =>
            Promise.resolve({
                _id: "63adcff10e718f3a3e7e65b9",
                email: "jenny.wright@email.com",
                password:
                    "$2a$10$uxdgbAZ0qu5oA1W574etDeGWukVsrOLCkZc0e/IFaronBO3gtBBza",
                householdID: null,
                name: "Jenny Wright",
                date: "2022-12-30T14:00:28.108Z",
            })
        );

        const response = await request(server)
            .get("/api/household")
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            error: true,
            message: "The specified user does not belong to a household",
        });
    });

    test("A failed get household attempt due to missing auth token", async () => {
        const response = await request(server).get("/api/household");

        expect(response.statusCode).toBe(401);
        expect(response.body).toEqual({
            message: "Access Denied",
        });
    });

    test("A failed get household attempt due to invalid auth token", async () => {
        const response = await request(server)
            .get("/api/household")
            .set("auth-token", "n0t-a-t0k3n");

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            message: "Invalid Token",
        });
    });
});

// Test the leave household endpoint with successful requests
describe("Successful leave household endpoint tests", () => {
    test("A successful leave household attempt", async () => {
        findOneUser.mockImplementation(() =>
            Promise.resolve({
                _id: "63adcff10e718f3a3e7e65b9",
                email: "jenny.wright@email.com",
                password:
                    "$2a$10$uxdgbAZ0qu5oA1W574etDeGWukVsrOLCkZc0e/IFaronBO3gtBBza",
                householdID: "63adcff10e728f3a3e5e65b7",
                name: "Jenny Wright",
                date: "2022-12-30T14:00:28.108Z",
            })
        );
        findOneHousehold.mockImplementation(() =>
            Promise.resolve({
                _id: "63adcff10e728f3a3e5e65b7",
                members: [
                    "63b1ba6da2b164d686b35ae3",
                    "63b1ba96a2b164d686b35af8",
                    "63adcff10e718f3a3e7e65b9",
                ],
                choreAssignees: [
                    "63b1ba6da2b164d686b35ae3",
                    "63b1ba96a2b164d686b35af8",
                    "63adcff10e718f3a3e7e65b9",
                ],
            })
        );
        findHouseholdByIdAndUpdate.mockImplementation(() =>
            Promise.resolve({
                _id: "63adcff10e728f3a3e5e65b7",
                members: [
                    "63b1ba6da2b164d686b35ae3",
                    "63b1ba96a2b164d686b35af8",
                ],
            })
        );
        findUserByIdAndUpdate.mockImplementation(() => Promise.resolve(true));
        saveNotification.mockImplementation(() => Promise.resolve(true));
        updateManyUser.mockImplementation(() => Promise.resolve(true));

        const response = await request(server)
            .patch("/api/household/leave")
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            householdId: null,
        });
    });
});

// Test the leave household endpoint with failed requests
describe("Failed leave household endpoint tests", () => {
    test("A failed leave household attempt due to user not belonging to a household", async () => {
        findOneUser.mockImplementation(() =>
            Promise.resolve({
                _id: "63adcff10e718f3a3e7e65b9",
                email: "jenny.wright@email.com",
                password:
                    "$2a$10$uxdgbAZ0qu5oA1W574etDeGWukVsrOLCkZc0e/IFaronBO3gtBBza",
                householdID: null,
                name: "Jenny Wright",
                date: "2022-12-30T14:00:28.108Z",
            })
        );
        findOneHousehold.mockImplementation(() => Promise.resolve(null));

        const response = await request(server)
            .patch("/api/household/leave")
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            error: true,
            message: "The specified user does not belong to a household",
        });
    });

    test("A failed leave household attempt due to specified household not being found", async () => {
        findOneUser.mockImplementation(() =>
            Promise.resolve({
                _id: "63adcff10e718f3a3e7e65b9",
                email: "jenny.wright@email.com",
                password:
                    "$2a$10$uxdgbAZ0qu5oA1W574etDeGWukVsrOLCkZc0e/IFaronBO3gtBBza",
                householdID: "63adcff10e728f3a3e5e65b7",
                name: "Jenny Wright",
                date: "2022-12-30T14:00:28.108Z",
            })
        );
        findOneHousehold
            .mockReturnValueOnce({
                _id: "63adcff10e728f3a3e5e65b7",
                members: [
                    "63b1ba6da2b164d686b35ae3",
                    "63b1ba96a2b164d686b35af8",
                    "63adcff10e718f3a3e7e65b9",
                ],
            })
            .mockReturnValueOnce(null);

        const response = await request(server)
            .patch("/api/household/leave")
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            error: true,
            message: "The specified household does not exist",
        });
    });

    test("A failed leave household attempt due to the household not containing any members", async () => {
        findOneUser.mockImplementation(() =>
            Promise.resolve({
                _id: "63adcff10e718f3a3e7e65b9",
                email: "jenny.wright@email.com",
                password:
                    "$2a$10$uxdgbAZ0qu5oA1W574etDeGWukVsrOLCkZc0e/IFaronBO3gtBBza",
                householdID: "63adcff10e728f3a3e5e65b7",
                name: "Jenny Wright",
                date: "2022-12-30T14:00:28.108Z",
            })
        );
        findOneHousehold.mockImplementation(() =>
            Promise.resolve({
                _id: "63adcff10e728f3a3e5e65b7",
                members: [],
            })
        );

        const response = await request(server)
            .patch("/api/household/leave")
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            error: true,
            message:
                "The specified household does not have any members to remove",
        });
    });

    test("A failed leave household attempt due to the specified user not belonging the specified household", async () => {
        findOneUser.mockImplementation(() =>
            Promise.resolve({
                _id: "63adcff10e718f3a3e7e65b9",
                email: "jenny.wright@email.com",
                password:
                    "$2a$10$uxdgbAZ0qu5oA1W574etDeGWukVsrOLCkZc0e/IFaronBO3gtBBza",
                householdID: "63adcff10e728f3a3e5e65b7",
                name: "Jenny Wright",
                date: "2022-12-30T14:00:28.108Z",
            })
        );
        findOneHousehold.mockImplementation(() =>
            Promise.resolve({
                _id: "63adcff10e728f3a3e5e65b7",
                members: [
                    "63b1ba6da2b164d686b35ae3",
                    "63b1ba96a2b164d686b35af8",
                ],
            })
        );

        const response = await request(server)
            .patch("/api/household/leave")
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            error: true,
            message:
                "The specified user does not belong to the specified household",
        });
    });

    test("A failed leave household attempt due to an error occurring during the save notification operation", async () => {
        findOneUser.mockImplementation(() =>
            Promise.resolve({
                _id: "63adcff10e718f3a3e7e65b9",
                email: "jenny.wright@email.com",
                password:
                    "$2a$10$uxdgbAZ0qu5oA1W574etDeGWukVsrOLCkZc0e/IFaronBO3gtBBza",
                householdID: "63adcff10e728f3a3e5e65b7",
                name: "Jenny Wright",
                date: "2022-12-30T14:00:28.108Z",
            })
        );
        findOneHousehold.mockImplementation(() =>
            Promise.resolve({
                _id: "63adcff10e728f3a3e5e65b7",
                members: [
                    "63b1ba6da2b164d686b35ae3",
                    "63b1ba96a2b164d686b35af8",
                    "63adcff10e718f3a3e7e65b9",
                ],
                choreAssignees: [
                    "63b1ba6da2b164d686b35ae3",
                    "63b1ba96a2b164d686b35af8",
                    "63adcff10e718f3a3e7e65b9",
                ],
            })
        );
        findHouseholdByIdAndUpdate.mockImplementation(() =>
            Promise.resolve({
                _id: "63adcff10e728f3a3e5e65b7",
                members: [
                    "63b1ba6da2b164d686b35ae3",
                    "63b1ba96a2b164d686b35af8",
                ],
            })
        );
        findUserByIdAndUpdate.mockImplementation(() => Promise.resolve(true));
        saveNotification.mockImplementation(() => {
            throw new Error("Something went wrong");
        });

        const response = await request(server)
            .patch("/api/household/leave")
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            error: true,
            message: "Something went wrong",
        });
    });
});

// Test the invite to household endpoint with successful requests
describe("Successful invite to household endpoint tests", () => {
    test("A successful invite to household attempt", async () => {
        findOneUser
            .mockReturnValueOnce({
                _id: "63adcff10e718f3a3e7e65b9",
                email: "jenny.wright@email.com",
                password:
                    "$2a$10$uxdgbAZ0qu5oA1W574etDeGWukVsrOLCkZc0e/IFaronBO3gtBBza",
                householdID: "63adcff10e728f3a3e5e65b7",
                name: "Jenny Wright",
                date: "2022-12-30T14:00:28.108Z",
            })
            .mockReturnValueOnce(null);
        findOneHousehold.mockImplementation(() =>
            Promise.resolve({
                _id: "63adcff10e728f3a3e5e65b7",
                members: [
                    "63b1ba6da2b164d686b35ae3",
                    "63b1ba96a2b164d686b35af8",
                    "63adcff10e718f3a3e7e65b9",
                ],
            })
        );
        sendMail.mockImplementation(() => Promise.resolve(true));

        const response = await request(server)
            .post("/api/household/invite")
            .send({ email: "todd.howard@email.com" })
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            error: false,
            message: "An invitation was successfully sent",
        });
    });

    test("A successful invite to household attempt where the recipient is an account holder who already belongs to a household", async () => {
        findOneUser
            .mockReturnValueOnce({
                _id: "63adcff10e718f3a3e7e65b9",
                email: "jenny.wright@email.com",
                password:
                    "$2a$10$uxdgbAZ0qu5oA1W574etDeGWukVsrOLCkZc0e/IFaronBO3gtBBza",
                householdID: "63adcff10e728f3a3e5e65b7",
                name: "Jenny Wright",
                date: "2022-12-30T14:00:28.108Z",
            })
            .mockReturnValueOnce({
                _id: "63b1ba6da2b164d686b35ae3",
                householdID: "63adcff10e728f3a3e5e65a1",
            });
        findOneHousehold.mockImplementation(() =>
            Promise.resolve({
                _id: "63adcff10e728f3a3e5e65b7",
                members: [
                    "63b1ba96a2b164d686b35af8",
                    "63adcff10e718f3a3e7e65b9",
                ],
            })
        );
        sendMail.mockImplementation(() => Promise.resolve(true));

        const response = await request(server)
            .post("/api/household/invite")
            .send({ email: "todd.howard@email.com" })
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            error: false,
            message: "An invitation was successfully sent",
        });
    });

    test("A successful invite to household attempt where the recipient is an account holder who does not belong to a household", async () => {
        findOneUser
            .mockReturnValueOnce({
                _id: "63adcff10e718f3a3e7e65b9",
                email: "jenny.wright@email.com",
                password:
                    "$2a$10$uxdgbAZ0qu5oA1W574etDeGWukVsrOLCkZc0e/IFaronBO3gtBBza",
                householdID: "63adcff10e728f3a3e5e65b7",
                name: "Jenny Wright",
                date: "2022-12-30T14:00:28.108Z",
            })
            .mockReturnValueOnce({
                _id: "63b1ba6da2b164d686b35ae3",
            });
        findOneHousehold.mockImplementation(() =>
            Promise.resolve({
                _id: "63adcff10e728f3a3e5e65b7",
                members: [
                    "63b1ba96a2b164d686b35af8",
                    "63adcff10e718f3a3e7e65b9",
                ],
            })
        );
        sendMail.mockImplementation(() => Promise.resolve(true));

        const response = await request(server)
            .post("/api/household/invite")
            .send({ email: "todd.howard@email.com" })
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            error: false,
            message: "An invitation was successfully sent",
        });
    });
});

// Test the invite to household endpoint with failed requests
describe("Failed invite to household endpoint tests", () => {
    test("A failed invite to household attempt due to invalid email address being provided", async () => {
        findOneUser.mockImplementation(() =>
            Promise.resolve({
                _id: "63adcff10e718f3a3e7e65b9",
                email: "jenny.wright@email.com",
                password:
                    "$2a$10$uxdgbAZ0qu5oA1W574etDeGWukVsrOLCkZc0e/IFaronBO3gtBBza",
                householdID: "63adcff10e728f3a3e5e65b7",
                name: "Jenny Wright",
                date: "2022-12-30T14:00:28.108Z",
            })
        );
        findOneHousehold.mockImplementation(() =>
            Promise.resolve({
                _id: "63adcff10e728f3a3e5e65b7",
                members: [
                    "63b1ba6da2b164d686b35ae3",
                    "63b1ba96a2b164d686b35af8",
                    "63adcff10e718f3a3e7e65b9",
                ],
            })
        );

        const response = await request(server)
            .post("/api/household/invite")
            .send({ email: "not_an_email" })
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            error: true,
            message: '"email" must be a valid email',
        });
    });

    test("A failed invite to household attempt due to user providing their own email address as a parameter", async () => {
        findOneUser.mockImplementation(() =>
            Promise.resolve({
                _id: "63adcff10e718f3a3e7e65b9",
                email: "jenny.wright@email.com",
                password:
                    "$2a$10$uxdgbAZ0qu5oA1W574etDeGWukVsrOLCkZc0e/IFaronBO3gtBBza",
                householdID: "63adcff10e728f3a3e5e65b7",
                name: "Jenny Wright",
                date: "2022-12-30T14:00:28.108Z",
            })
        );
        findOneHousehold.mockImplementation(() =>
            Promise.resolve({
                _id: "63adcff10e728f3a3e5e65b7",
                members: [
                    "63b1ba6da2b164d686b35ae3",
                    "63b1ba96a2b164d686b35af8",
                    "63adcff10e718f3a3e7e65b9",
                ],
            })
        );

        const response = await request(server)
            .post("/api/household/invite")
            .send({ email: "jenny.wright@email.com" })
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            error: true,
            message: "You cannot send an invite to yourself",
        });
    });

    test("A failed invite to household attempt due to user not belonging to a household", async () => {
        findOneUser.mockImplementation(() =>
            Promise.resolve({
                _id: "63adcff10e718f3a3e7e65b9",
                email: "jenny.wright@email.com",
                password:
                    "$2a$10$uxdgbAZ0qu5oA1W574etDeGWukVsrOLCkZc0e/IFaronBO3gtBBza",
                householdID: null,
                name: "Jenny Wright",
                date: "2022-12-30T14:00:28.108Z",
            })
        );
        findOneHousehold.mockImplementation(() => Promise.resolve(null));

        const response = await request(server)
            .post("/api/household/invite")
            .send({ email: "todd.howard@email.com" })
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            error: true,
            message: "The specified user does not belong to a household",
        });
    });

    test("A failed invite to household attempt due to specified household not being found", async () => {
        findOneUser.mockImplementation(() =>
            Promise.resolve({
                _id: "63adcff10e718f3a3e7e65b9",
                email: "jenny.wright@email.com",
                password:
                    "$2a$10$uxdgbAZ0qu5oA1W574etDeGWukVsrOLCkZc0e/IFaronBO3gtBBza",
                householdID: "63adcff10e728f3a3e5e65b7",
                name: "Jenny Wright",
                date: "2022-12-30T14:00:28.108Z",
            })
        );
        findOneHousehold
            .mockReturnValueOnce({
                _id: "63adcff10e728f3a3e5e65b7",
                members: [
                    "63b1ba6da2b164d686b35ae3",
                    "63b1ba96a2b164d686b35af8",
                    "63adcff10e718f3a3e7e65b9",
                ],
            })
            .mockReturnValueOnce(null);

        const response = await request(server)
            .post("/api/household/invite")
            .send({ email: "todd.howard@email.com" })
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            error: true,
            message: "The specified household does not exist",
        });
    });

    test("A failed invite to household attempt due to the household capacity being full", async () => {
        findOneUser.mockImplementation(() =>
            Promise.resolve({
                _id: "63adcff10e718f3a3e7e65b9",
                email: "jenny.wright@email.com",
                password:
                    "$2a$10$uxdgbAZ0qu5oA1W574etDeGWukVsrOLCkZc0e/IFaronBO3gtBBza",
                householdID: "63adcff10e728f3a3e5e65b7",
                name: "Jenny Wright",
                date: "2022-12-30T14:00:28.108Z",
            })
        );
        findOneHousehold.mockImplementation(() =>
            Promise.resolve({
                _id: "63adcff10e728f3a3e5e65b7",
                members: [
                    "63b1ba6da2b164d686b35ae3",
                    "63b1ba96a2b164d686b35af8",
                    "63adcff10e718f3a3e7e65b9",
                    "63b1ba6da2b164d686b35aa3",
                    "63b1ba96a2b164d686b35ab8",
                    "63adcff10e718f3a3e7e65c9",
                    "63b1ba6da2b164d686b35ad3",
                    "63b1ba96a2b164d686b35ae8",
                    "63adcff10e718f3a3e7e65f9",
                    "63b1ba6da2b164d686b35a13",
                ],
            })
        );

        const response = await request(server)
            .post("/api/household/invite")
            .send({ email: "todd.howard@email.com" })
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            error: true,
            message:
                "The specified household does not have room for any more members",
        });
    });

    test("A failed invite to household attempt due to the user not belonging to the specified household", async () => {
        findOneUser.mockImplementation(() =>
            Promise.resolve({
                _id: "63adcff10e718f3a3e7e65b9",
                email: "jenny.wright@email.com",
                password:
                    "$2a$10$uxdgbAZ0qu5oA1W574etDeGWukVsrOLCkZc0e/IFaronBO3gtBBza",
                householdID: "63adcff10e728f3a3e5e65b7",
                name: "Jenny Wright",
                date: "2022-12-30T14:00:28.108Z",
            })
        );
        findOneHousehold.mockImplementation(() =>
            Promise.resolve({
                _id: "63adcff10e728f3a3e5e65b7",
                members: [
                    "63b1ba6da2b164d686b35ae3",
                    "63b1ba96a2b164d686b35af8",
                    "63b1ba6da2b164d686b35aa3",
                ],
            })
        );

        const response = await request(server)
            .post("/api/household/invite")
            .send({ email: "todd.howard@email.com" })
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            error: true,
            message:
                "The specified user does not belong to the specified household",
        });
    });

    test("A failed invite to household attempt due to the invited user already belonging to the specified household", async () => {
        findOneUser
            .mockReturnValueOnce({
                _id: "63adcff10e718f3a3e7e65b9",
                email: "jenny.wright@email.com",
                password:
                    "$2a$10$uxdgbAZ0qu5oA1W574etDeGWukVsrOLCkZc0e/IFaronBO3gtBBza",
                householdID: "63adcff10e728f3a3e5e65b7",
                name: "Jenny Wright",
                date: "2022-12-30T14:00:28.108Z",
            })
            .mockReturnValueOnce({
                _id: "63b1ba6da2b164d686b35ae3",
                householdID: "63adcff10e728f3a3e5e65b7",
            });
        findOneHousehold.mockImplementation(() =>
            Promise.resolve({
                _id: "63adcff10e728f3a3e5e65b7",
                members: [
                    "63b1ba6da2b164d686b35ae3",
                    "63b1ba96a2b164d686b35af8",
                    "63b1ba6da2b164d686b35aa3",
                    "63adcff10e718f3a3e7e65b9",
                ],
            })
        );

        const response = await request(server)
            .post("/api/household/invite")
            .send({ email: "todd.howard@email.com" })
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            error: true,
            message:
                "The specified recipient is already a member of this household",
        });
    });

    test("A failed invite to household attempt due to an error occurring during the send mail operation", async () => {
        findOneUser
            .mockReturnValueOnce({
                _id: "63adcff10e718f3a3e7e65b9",
                email: "jenny.wright@email.com",
                password:
                    "$2a$10$uxdgbAZ0qu5oA1W574etDeGWukVsrOLCkZc0e/IFaronBO3gtBBza",
                householdID: "63adcff10e728f3a3e5e65b7",
                name: "Jenny Wright",
                date: "2022-12-30T14:00:28.108Z",
            })
            .mockReturnValueOnce(null);
        findOneHousehold.mockImplementation(() =>
            Promise.resolve({
                _id: "63adcff10e728f3a3e5e65b7",
                members: [
                    "63b1ba6da2b164d686b35ae3",
                    "63b1ba96a2b164d686b35af8",
                    "63adcff10e718f3a3e7e65b9",
                ],
            })
        );
        sendMail.mockImplementation(() => {
            throw new Error("Something went wrong");
        });

        const response = await request(server)
            .post("/api/household/invite")
            .send({ email: "todd.howard@email.com" })
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            error: true,
            message: "The invitiation request failed",
        });
    });
});

// Test the update chores list endpoint with successful requests
describe("Successful update chores list endpoint tests", () => {
    test("A successful update chores list attempt", async () => {
        findOneUser.mockImplementation(() =>
            Promise.resolve({
                _id: "63adcff10e718f3a3e7e65b9",
                email: "jenny.wright@email.com",
                password:
                    "$2a$10$uxdgbAZ0qu5oA1W574etDeGWukVsrOLCkZc0e/IFaronBO3gtBBza",
                householdID: "63adcff10e728f3a3e5e65b7",
                name: "Jenny Wright",
                date: "2022-12-30T14:00:28.108Z",
            })
        );
        findOneHousehold.mockImplementation(() =>
            Promise.resolve({
                _id: "63adcff10e728f3a3e5e65b7",
                chores: [
                    "63b1ba6da2b164d686b35ae1",
                    "63adcff10e718f3a3e7e65b3",
                    "63b1ba96a2b164d686b35af2",
                ],
            })
        );
        findHouseholdByIdAndUpdate.mockImplementation(() =>
            Promise.resolve(true)
        );

        const response = await request(server)
            .patch("/api/household/chores")
            .send({
                chores: [
                    "63b1ba6da2b164d686b35ae1",
                    "63b1ba96a2b164d686b35af2",
                    "63adcff10e718f3a3e7e65b3",
                ],
            })
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            chores: [
                "63b1ba6da2b164d686b35ae1",
                "63b1ba96a2b164d686b35af2",
                "63adcff10e718f3a3e7e65b3",
            ],
        });
    });
});

// Test the update chores list endpoint with failed requests
describe("Failed update chores list endpoint tests", () => {
    test("A failed update chores list attempt due to user not belonging to a household", async () => {
        findOneUser.mockImplementation(() =>
            Promise.resolve({
                _id: "63adcff10e718f3a3e7e65b9",
                email: "jenny.wright@email.com",
                password:
                    "$2a$10$uxdgbAZ0qu5oA1W574etDeGWukVsrOLCkZc0e/IFaronBO3gtBBza",
                householdID: null,
                name: "Jenny Wright",
                date: "2022-12-30T14:00:28.108Z",
            })
        );
        findOneHousehold.mockImplementation(() => Promise.resolve(null));

        const response = await request(server)
            .patch("/api/household/chores")
            .send({
                chores: [
                    "63b1ba6da2b164d686b35ae1",
                    "63b1ba96a2b164d686b35af2",
                    "63adcff10e718f3a3e7e65b3",
                ],
            })
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            error: true,
            message: "The specified user does not belong to a household",
        });
    });

    test("A failed update chores list attempt due to no input parameter being supplied by the user", async () => {
        findOneUser.mockImplementation(() =>
            Promise.resolve({
                _id: "63adcff10e718f3a3e7e65b9",
                email: "jenny.wright@email.com",
                password:
                    "$2a$10$uxdgbAZ0qu5oA1W574etDeGWukVsrOLCkZc0e/IFaronBO3gtBBza",
                householdID: "63adcff10e728f3a3e5e65b7",
                name: "Jenny Wright",
                date: "2022-12-30T14:00:28.108Z",
            })
        );
        findOneHousehold.mockImplementation(() =>
            Promise.resolve({
                _id: "63adcff10e728f3a3e5e65b7",
                chores: [
                    "63b1ba6da2b164d686b35ae1",
                    "63adcff10e718f3a3e7e65b3",
                    "63b1ba96a2b164d686b35af2",
                ],
            })
        );

        const response = await request(server)
            .patch("/api/household/chores")
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            error: true,
            message: "A list of chores must be provided",
        });
    });

    test("A failed update chores list attempt due to an invalid input parameter being supplied by the user", async () => {
        findOneUser.mockImplementation(() =>
            Promise.resolve({
                _id: "63adcff10e718f3a3e7e65b9",
                email: "jenny.wright@email.com",
                password:
                    "$2a$10$uxdgbAZ0qu5oA1W574etDeGWukVsrOLCkZc0e/IFaronBO3gtBBza",
                householdID: "63adcff10e728f3a3e5e65b7",
                name: "Jenny Wright",
                date: "2022-12-30T14:00:28.108Z",
            })
        );
        findOneHousehold.mockImplementation(() =>
            Promise.resolve({
                _id: "63adcff10e728f3a3e5e65b7",
                chores: [
                    "63b1ba6da2b164d686b35ae1",
                    "63adcff10e718f3a3e7e65b3",
                    "63b1ba96a2b164d686b35af2",
                ],
            })
        );

        const response = await request(server)
            .patch("/api/household/chores")
            .send({
                chores: "Not an array!",
            })
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            error: true,
            message: "'chores' parameter must be an array",
        });
    });

    test("A failed update chores list attempt due to input chore array not containing the same amount of chores as the household list of chores", async () => {
        findOneUser.mockImplementation(() =>
            Promise.resolve({
                _id: "63adcff10e718f3a3e7e65b9",
                email: "jenny.wright@email.com",
                password:
                    "$2a$10$uxdgbAZ0qu5oA1W574etDeGWukVsrOLCkZc0e/IFaronBO3gtBBza",
                householdID: "63adcff10e728f3a3e5e65b7",
                name: "Jenny Wright",
                date: "2022-12-30T14:00:28.108Z",
            })
        );
        findOneHousehold.mockImplementation(() =>
            Promise.resolve({
                _id: "63adcff10e728f3a3e5e65b7",
                chores: [
                    "63b1ba6da2b164d686b35ae1",
                    "63adcff10e718f3a3e7e65b3",
                    "63b1ba96a2b164d686b35af2",
                ],
            })
        );

        const response = await request(server)
            .patch("/api/household/chores")
            .send({
                chores: ["63b1ba6da2b164d686b35ae1"],
            })
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            error: true,
            message:
                "'chores' parameter must be the same length as the household chores list",
        });
    });

    test("A failed update chores list attempt due to an invalid chore id within the input parameter", async () => {
        findOneUser.mockImplementation(() =>
            Promise.resolve({
                _id: "63adcff10e718f3a3e7e65b9",
                email: "jenny.wright@email.com",
                password:
                    "$2a$10$uxdgbAZ0qu5oA1W574etDeGWukVsrOLCkZc0e/IFaronBO3gtBBza",
                householdID: "63adcff10e728f3a3e5e65b7",
                name: "Jenny Wright",
                date: "2022-12-30T14:00:28.108Z",
            })
        );
        findOneHousehold.mockImplementation(() =>
            Promise.resolve({
                _id: "63adcff10e728f3a3e5e65b7",
                chores: [
                    "63b1ba6da2b164d686b35ae1",
                    "63adcff10e718f3a3e7e65b3",
                    "63b1ba96a2b164d686b35af2",
                ],
            })
        );

        const response = await request(server)
            .patch("/api/household/chores")
            .send({
                chores: [
                    "63b1ba6da2b164d686b35ae1",
                    "not_a_valid_id",
                    "63b1ba96a2b164d686b35af2",
                ],
            })
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            error: true,
            message: "An invalid chore ID was specified",
        });
    });

    test("A failed update chores list attempt due to an unknown chore id within the input parameter", async () => {
        findOneUser.mockImplementation(() =>
            Promise.resolve({
                _id: "63adcff10e718f3a3e7e65b9",
                email: "jenny.wright@email.com",
                password:
                    "$2a$10$uxdgbAZ0qu5oA1W574etDeGWukVsrOLCkZc0e/IFaronBO3gtBBza",
                householdID: "63adcff10e728f3a3e5e65b7",
                name: "Jenny Wright",
                date: "2022-12-30T14:00:28.108Z",
            })
        );
        findOneHousehold.mockImplementation(() =>
            Promise.resolve({
                _id: "63adcff10e728f3a3e5e65b7",
                chores: [
                    "63b1ba6da2b164d686b35ae1",
                    "63adcff10e718f3a3e7e65b3",
                    "63b1ba96a2b164d686b35af2",
                ],
            })
        );

        const response = await request(server)
            .patch("/api/household/chores")
            .send({
                chores: [
                    "63b1ba6da2b164d686b35ae1",
                    "63adcff10e718f3a3e7e65b5",
                    "63b1ba96a2b164d686b35af2",
                ],
            })
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            error: true,
            message: "An unexpected chore ID was specified",
        });
    });
});

// Test the update profile photo endpoint with successful requests
describe("Successful update profile photo endpoint tests", () => {
    test("A successful update profile photo attempt", async () => {
        findOneUser.mockImplementation(() =>
            Promise.resolve({
                _id: "63adcff10e718f3a3e7e65b9",
                email: "jenny.wright@email.com",
                password:
                    "$2a$10$uxdgbAZ0qu5oA1W574etDeGWukVsrOLCkZc0e/IFaronBO3gtBBza",
                householdID: "63adcff10e728f3a3e5e65b7",
                name: "Jenny Wright",
                date: "2022-12-30T14:00:28.108Z",
            })
        );
        findOneHousehold.mockImplementation(() =>
            Promise.resolve({
                _id: "63adcff10e728f3a3e5e65b7",
            })
        );
        findUserByIdAndUpdate.mockImplementation(() => Promise.resolve(true));

        const response = await request(server)
            .patch("/api/household/profile/photo")
            .send({
                profilePhoto: 34,
            })
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            error: false,
            message: "Profile photo successfully updated",
        });
    });
});

// Test the update profile photo endpoint with failed requests
describe("Failed update profile photo endpoint tests", () => {
    test("A failed update profile photo attempt due to user not belonging to a household", async () => {
        findOneUser.mockImplementation(() =>
            Promise.resolve({
                _id: "63adcff10e718f3a3e7e65b9",
                email: "jenny.wright@email.com",
                password:
                    "$2a$10$uxdgbAZ0qu5oA1W574etDeGWukVsrOLCkZc0e/IFaronBO3gtBBza",
                householdID: null,
                name: "Jenny Wright",
                date: "2022-12-30T14:00:28.108Z",
            })
        );
        findOneHousehold.mockImplementation(() => Promise.resolve(null));

        const response = await request(server)
            .patch("/api/household/profile/photo")
            .send({
                profilePhoto: 25,
            })
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            error: true,
            message: "The specified user does not belong to a household",
        });
    });

    test("A failed update profile photo attempt due to no parameter being supplied by the user", async () => {
        findOneUser.mockImplementation(() =>
            Promise.resolve({
                _id: "63adcff10e718f3a3e7e65b9",
                email: "jenny.wright@email.com",
                password:
                    "$2a$10$uxdgbAZ0qu5oA1W574etDeGWukVsrOLCkZc0e/IFaronBO3gtBBza",
                householdID: "63adcff10e728f3a3e5e65b7",
                name: "Jenny Wright",
                date: "2022-12-30T14:00:28.108Z",
            })
        );
        findOneHousehold.mockImplementation(() =>
            Promise.resolve({
                _id: "63adcff10e728f3a3e5e65b7",
            })
        );

        const response = await request(server)
            .patch("/api/household/profile/photo")
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            error: true,
            message: "A profile photo selection must be provided",
        });
    });

    test("A failed update profile photo attempt due to out of range negative prameter", async () => {
        findOneUser.mockImplementation(() =>
            Promise.resolve({
                _id: "63adcff10e718f3a3e7e65b9",
                email: "jenny.wright@email.com",
                password:
                    "$2a$10$uxdgbAZ0qu5oA1W574etDeGWukVsrOLCkZc0e/IFaronBO3gtBBza",
                householdID: "63adcff10e728f3a3e5e65b7",
                name: "Jenny Wright",
                date: "2022-12-30T14:00:28.108Z",
            })
        );
        findOneHousehold.mockImplementation(() =>
            Promise.resolve({
                _id: "63adcff10e728f3a3e5e65b7",
            })
        );

        const response = await request(server)
            .patch("/api/household/profile/photo")
            .send({
                profilePhoto: -15,
            })
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            error: true,
            message: "Profile photo selection is out of range",
        });
    });

    test("A failed update profile photo attempt due to invalid parameter type being supplied by the user", async () => {
        findOneUser.mockImplementation(() =>
            Promise.resolve({
                _id: "63adcff10e718f3a3e7e65b9",
                email: "jenny.wright@email.com",
                password:
                    "$2a$10$uxdgbAZ0qu5oA1W574etDeGWukVsrOLCkZc0e/IFaronBO3gtBBza",
                householdID: "63adcff10e728f3a3e5e65b7",
                name: "Jenny Wright",
                date: "2022-12-30T14:00:28.108Z",
            })
        );
        findOneHousehold.mockImplementation(() =>
            Promise.resolve({
                _id: "63adcff10e728f3a3e5e65b7",
            })
        );

        const response = await request(server)
            .patch("/api/household/profile/photo")
            .send({
                profilePhoto: "Not a number!",
            })
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            error: true,
            message: "Profile photo selection is invalid",
        });
    });
});
