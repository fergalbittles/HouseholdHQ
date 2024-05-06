const request = require("supertest");
const server = require("../../index");
const mongoose = require("mongoose");
const User = require("../../model/User");
const Household = require("../../model/Household");
const Chore = require("../../model/Chore");
const Notification = require("../../model/Notification");

// Mock database queries
const findOneUser = jest.spyOn(User, "findOne");
const findUserByIdAndUpdate = jest.spyOn(User, "findByIdAndUpdate");
const updateManyUser = jest.spyOn(User, "updateMany");
const findOneChore = jest.spyOn(Chore, "findOne");
const deleteOneChore = jest.spyOn(Chore, "deleteOne");
const findChore = jest.spyOn(Chore, "find");
const findHouseholdByIdAndUpdate = jest.spyOn(Household, "findByIdAndUpdate");
const findChoreByIdAndUpdate = jest.spyOn(Chore, "findByIdAndUpdate");
const findOneHousehold = jest.spyOn(Household, "findOne");
const saveChore = jest.spyOn(Chore.prototype, "save");
const saveNotification = jest.spyOn(Notification.prototype, "save");

// Open database connection before each test
beforeAll(() => {
    mongoose.connect(process.env.DB_CONNECT);
});

// Close database connection after all tests
afterAll(async () => {
    await findOneHousehold.mockRestore();
    await findOneUser.mockRestore();
    await findUserByIdAndUpdate.mockRestore();
    await findOneChore.mockRestore();
    await findHouseholdByIdAndUpdate.mockRestore();
    await findChoreByIdAndUpdate.mockRestore();
    await findChore.mockRestore();
    await saveChore.mockRestore();
    await saveNotification.mockRestore();
    await updateManyUser.mockRestore();
    await deleteOneChore.mockRestore();
    await mongoose.connection.close();
});

// Test the get chore endpoint with successful requests
describe("Successful get chore endpoint tests", () => {
    test("A successful get chore attempt", async () => {
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
                    "63adcff10e718f3a3e7e65b7",
                    "63b1ba6da2b164d686b35ae6",
                    "63b1ba96a2b164d686b35af5",
                    "63add086f596db4596f559a4",
                ],
            })
        );
        findOneChore.mockImplementation(() =>
            Promise.resolve({
                _id: "63add086f596db4596f559a4",
            })
        );

        const response = await request(server)
            .get("/api/chore?choreId=63add086f596db4596f559a4")
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            chore: {
                _id: "63add086f596db4596f559a4",
            },
        });
    });
});

// Test the get chore endpoint with failed requests
describe("Failed get chore endpoint tests", () => {
    test("A failed get chore attempt due to user not belonging to a household", async () => {
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
            .get("/api/chore?choreId=63add086f596db4596f559a4")
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

    test("A failed get chore attempt due to user not providing a chore id", async () => {
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
                    "63adcff10e718f3a3e7e65b7",
                    "63b1ba6da2b164d686b35ae6",
                    "63b1ba96a2b164d686b35af5",
                    "63add086f596db4596f559a4",
                ],
            })
        );

        const response = await request(server)
            .get("/api/chore")
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            error: true,
            message: "A chore ID was not provided",
        });
    });

    test("A failed get chore attempt due to user providing an invalid chore id", async () => {
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
                    "63adcff10e718f3a3e7e65b7",
                    "63b1ba6da2b164d686b35ae6",
                    "63b1ba96a2b164d686b35af5",
                    "63add086f596db4596f559a4",
                ],
            })
        );

        const response = await request(server)
            .get("/api/chore?choreId=not-a-valid-id")
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            error: true,
            message: "The provided chore ID is invalid",
        });
    });

    test("A failed get chore attempt due to user providing an id for a chore which does not exist", async () => {
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
                    "63adcff10e718f3a3e7e65b7",
                    "63b1ba6da2b164d686b35ae6",
                    "63b1ba96a2b164d686b35af5",
                    "63add086f596db4596f559a4",
                ],
            })
        );
        findOneChore.mockImplementation(() => Promise.resolve(null));

        const response = await request(server)
            .get("/api/chore?choreId=63add086f596db4596f559a4")
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            error: true,
            message: "The specified chore does not exist",
        });
    });

    test("A failed get chore attempt due to the specified chore not belonging to the specified household", async () => {
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
                chores: [],
            })
        );
        findOneChore.mockImplementation(() =>
            Promise.resolve({
                _id: "63add086f596db4596f559a4",
            })
        );

        const response = await request(server)
            .get("/api/chore?choreId=63add086f596db4596f559a4")
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            error: true,
            message:
                "The specified chore does not belong to the specified household",
        });
    });
});

// Test the get all chores endpoint with successful requests
describe("Successful get all chores endpoint tests", () => {
    test("A successful get all chores attempt", async () => {
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
                    "63adcff10e718f3a3e7e65b7",
                    "63b1ba6da2b164d686b35ae6",
                    "63b1ba96a2b164d686b35af5",
                    "63add086f596db4596f559a4",
                ],
            })
        );
        findChore.mockImplementation(() =>
            Promise.resolve([
                {
                    _id: "63add086f596db4596f559a4",
                },
            ])
        );

        const response = await request(server)
            .get("/api/chore/all")
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            chores: [
                {
                    _id: "63add086f596db4596f559a4",
                },
            ],
        });
    });
});

// Test the get all chores endpoint with failed requests
describe("Failed get all chores endpoint tests", () => {
    test("A failed get all chores attempt due to user not belonging to a household", async () => {
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
            .get("/api/chore/all")
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
});

// Test the create chore endpoint with successful requests
describe("Successful create chore endpoint tests", () => {
    test("A successful create chore attempt", async () => {
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
                chores: [],
            })
        );
        saveChore.mockImplementation(() =>
            Promise.resolve({
                _id: "63add086f596db4596f559a4",
            })
        );
        findHouseholdByIdAndUpdate.mockImplementation(() =>
            Promise.resolve(true)
        );

        const response = await request(server)
            .post("/api/chore")
            .send({
                title: "Wash the dishes",
            })
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            chore: {
                _id: "63add086f596db4596f559a4",
            },
        });
    });
});

// Test the create chore endpoint with failed requests
describe("Failed create chore endpoint tests", () => {
    test("A failed create chore attempt due to user not belonging to a household", async () => {
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
            .post("/api/chore")
            .send({
                title: "Wash the dishes",
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

    test("A failed create chore attempt due to the specified household reaching the maximum amount of chores", async () => {
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
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                ],
            })
        );

        const response = await request(server)
            .post("/api/chore")
            .send({
                title: "Wash the dishes",
            })
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            error: true,
            message:
                "The specified household has reached the maximum amount of chores",
        });
    });

    test("A failed create chore attempt due to the user not providing a chore title", async () => {
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
                chores: [],
            })
        );

        const response = await request(server)
            .post("/api/chore")
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            error: true,
            message: '"title" is required',
        });
    });

    test("A failed create chore attempt due to an error occurring during the save operation", async () => {
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
                chores: [],
            })
        );
        saveChore.mockImplementation(() => {
            throw new Error("Something went wrong");
        });

        const response = await request(server)
            .post("/api/chore")
            .send({
                title: "Wash the dishes",
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

// Test the update chore endpoint with successful requests
describe("Successful update chore endpoint tests", () => {
    test("A successful update chore attempt", async () => {
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
                chores: ["63add086f596db4596f559a4"],
            })
        );
        findOneChore.mockImplementation(() =>
            Promise.resolve({
                _id: "63add086f596db4596f559a4",
                isCompleted: false,
            })
        );
        findChoreByIdAndUpdate.mockImplementation(() =>
            Promise.resolve({
                _id: "63add086f596db4596f559a4",
            })
        );

        const response = await request(server)
            .patch("/api/chore")
            .send({
                choreId: "63add086f596db4596f559a4",
                title: "Cook the dinner",
                description: "Burgers & Chips",
                priority: "Low",
                dateDue: Date.now(),
            })
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            chore: {
                _id: "63add086f596db4596f559a4",
            },
        });
    });
});

// Test the update chore endpoint with failed requests
describe("Failed update chore endpoint tests", () => {
    test("A failed update chore attempt due to user not belonging to a household", async () => {
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
            .patch("/api/chore")
            .send({
                choreId: "63add086f596db4596f559a4",
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

    test("A failed update chore attempt due to user not providing a chore id", async () => {
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
                chores: ["63add086f596db4596f559a4"],
                choreAssignees: [
                    "63b1ba6da2b164d686b35ae3",
                    "63b1ba96a2b164d686b35af8",
                    "63adcff10e718f3a3e7e65b9",
                ],
                members: [
                    "63adcff10e718f3a3e7e65b9",
                    "63b1ba96a2b164d686b35af8",
                ],
            })
        );

        const response = await request(server)
            .patch("/api/chore")
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            error: true,
            message: "A chore ID was not provided",
        });
    });

    test("A failed update chore attempt due to user providing an invalid chore id", async () => {
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
                chores: ["63add086f596db4596f559a4"],
                choreAssignees: [
                    "63b1ba6da2b164d686b35ae3",
                    "63b1ba96a2b164d686b35af8",
                    "63adcff10e718f3a3e7e65b9",
                ],
                members: [
                    "63adcff10e718f3a3e7e65b9",
                    "63b1ba96a2b164d686b35af8",
                ],
            })
        );

        const response = await request(server)
            .patch("/api/chore")
            .send({
                choreId: "invalid-chore-id",
            })
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            error: true,
            message: "The provided chore ID is invalid",
        });
    });

    test("A failed update chore attempt due to user providing an id for a chore which does not exist", async () => {
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
                chores: ["63add086f596db4596f559a4"],
                choreAssignees: [
                    "63b1ba6da2b164d686b35ae3",
                    "63b1ba96a2b164d686b35af8",
                    "63adcff10e718f3a3e7e65b9",
                ],
                members: [
                    "63adcff10e718f3a3e7e65b9",
                    "63b1ba96a2b164d686b35af8",
                ],
            })
        );
        findOneChore.mockImplementation(() => Promise.resolve(null));

        const response = await request(server)
            .patch("/api/chore")
            .send({
                choreId: "63add086f596db4596f559a4",
            })
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            error: true,
            message: "The specified chore does not exist",
        });
    });

    test("A failed update chore attempt due to user providing an id for a chore which is completed", async () => {
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
                chores: ["63add086f596db4596f559a4"],
                choreAssignees: [
                    "63b1ba6da2b164d686b35ae3",
                    "63b1ba96a2b164d686b35af8",
                    "63adcff10e718f3a3e7e65b9",
                ],
                members: [
                    "63adcff10e718f3a3e7e65b9",
                    "63b1ba96a2b164d686b35af8",
                ],
            })
        );
        findOneChore.mockImplementation(() =>
            Promise.resolve({
                _id: "63add086f596db4596f559a4",
                assignee: "63b1ba96a2b164d686b35af8",
                assigneeRequestPending: null,
                isCompleted: true,
            })
        );

        const response = await request(server)
            .patch("/api/chore")
            .send({
                choreId: "63add086f596db4596f559a4",
            })
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            error: true,
            message: "Cannot update a chore which has already been completed",
        });
    });

    test("A failed update chore attempt due to the specified chore not belonging to the specified household", async () => {
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
                chores: [],
                choreAssignees: [
                    "63b1ba6da2b164d686b35ae3",
                    "63b1ba96a2b164d686b35af8",
                    "63adcff10e718f3a3e7e65b9",
                ],
                members: [
                    "63adcff10e718f3a3e7e65b9",
                    "63b1ba96a2b164d686b35af8",
                ],
            })
        );
        findOneChore.mockImplementation(() =>
            Promise.resolve({
                _id: "63add086f596db4596f559a4",
                assignee: "63b1ba96a2b164d686b35af8",
                assigneeRequestPending: null,
                isCompleted: false,
            })
        );

        const response = await request(server)
            .patch("/api/chore")
            .send({
                choreId: "63add086f596db4596f559a4",
            })
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            error: true,
            message:
                "The specified chore does not belong to the specified household",
        });
    });

    test("A failed update chore attempt due to the user providing invalid chore data", async () => {
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
                chores: ["63add086f596db4596f559a4"],
                choreAssignees: [
                    "63b1ba6da2b164d686b35ae3",
                    "63b1ba96a2b164d686b35af8",
                    "63adcff10e718f3a3e7e65b9",
                ],
                members: [
                    "63adcff10e718f3a3e7e65b9",
                    "63b1ba96a2b164d686b35af8",
                ],
            })
        );
        findOneChore.mockImplementation(() =>
            Promise.resolve({
                _id: "63add086f596db4596f559a4",
                assignee: "63b1ba96a2b164d686b35af8",
                assigneeRequestPending: null,
                isCompleted: false,
            })
        );

        const response = await request(server)
            .patch("/api/chore")
            .send({
                choreId: "63add086f596db4596f559a4",
                title: -1,
            })
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            error: true,
            message: '"title" must be a string',
        });
    });

    test("A failed update chore attempt due to an error occurring during the update operation", async () => {
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
                chores: ["63add086f596db4596f559a4"],
                choreAssignees: [
                    "63b1ba6da2b164d686b35ae3",
                    "63b1ba96a2b164d686b35af8",
                    "63adcff10e718f3a3e7e65b9",
                ],
                members: [
                    "63adcff10e718f3a3e7e65b9",
                    "63b1ba96a2b164d686b35af8",
                ],
            })
        );
        findOneChore.mockImplementation(() =>
            Promise.resolve({
                _id: "63add086f596db4596f559a4",
                assignee: "63b1ba96a2b164d686b35af8",
                assigneeRequestPending: null,
                isCompleted: false,
            })
        );
        findChoreByIdAndUpdate.mockImplementation(() => {
            throw new Error("Something went wrong");
        });

        const response = await request(server)
            .patch("/api/chore")
            .send({
                choreId: "63add086f596db4596f559a4",
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

// Test the random assign chore endpoint with successful requests
describe("Successful random assign chore endpoint tests", () => {
    test("A successful random assign chore attempt", async () => {
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
                chores: ["63add086f596db4596f559a4"],
                choreAssignees: [
                    "63b1ba6da2b164d686b35ae3",
                    "63b1ba96a2b164d686b35af8",
                    "63adcff10e718f3a3e7e65b9",
                ],
            })
        );
        findOneChore.mockImplementation(() =>
            Promise.resolve({
                _id: "63add086f596db4596f559a4",
                isCompleted: false,
            })
        );
        findChoreByIdAndUpdate.mockImplementation(() =>
            Promise.resolve({
                _id: "63add086f596db4596f559a4",
            })
        );
        findHouseholdByIdAndUpdate.mockImplementation(() =>
            Promise.resolve(true)
        );
        saveNotification.mockImplementation(() => Promise.resolve(true));
        findUserByIdAndUpdate.mockImplementation(() => Promise.resolve(true));

        const response = await request(server)
            .patch("/api/chore/assign/random")
            .send({
                choreId: "63add086f596db4596f559a4",
            })
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            chore: {
                _id: "63add086f596db4596f559a4",
            },
        });
    });
});

// Test the random assign chore endpoint with failed requests
describe("Failed random assign chore endpoint tests", () => {
    test("A failed random assign chore attempt due to user not belonging to a household", async () => {
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
            .patch("/api/chore/assign/random")
            .send({
                choreId: "63add086f596db4596f559a4",
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

    test("A failed random assign chore attempt due to user not providing a chore id", async () => {
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
                chores: ["63add086f596db4596f559a4"],
                choreAssignees: [
                    "63b1ba6da2b164d686b35ae3",
                    "63b1ba96a2b164d686b35af8",
                    "63adcff10e718f3a3e7e65b9",
                ],
                members: [
                    "63adcff10e718f3a3e7e65b9",
                    "63b1ba96a2b164d686b35af8",
                ],
            })
        );

        const response = await request(server)
            .patch("/api/chore/assign/random")
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            error: true,
            message: "A chore ID was not provided",
        });
    });

    test("A failed random assign chore attempt due to user providing an invalid chore id", async () => {
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
                chores: ["63add086f596db4596f559a4"],
                choreAssignees: [
                    "63b1ba6da2b164d686b35ae3",
                    "63b1ba96a2b164d686b35af8",
                    "63adcff10e718f3a3e7e65b9",
                ],
                members: [
                    "63adcff10e718f3a3e7e65b9",
                    "63b1ba96a2b164d686b35af8",
                ],
            })
        );

        const response = await request(server)
            .patch("/api/chore/assign/random")
            .send({
                choreId: "invalid-chore-id",
            })
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            error: true,
            message: "The provided chore ID is invalid",
        });
    });

    test("A failed random assign chore attempt due to user providing an id for a chore which does not exist", async () => {
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
                chores: ["63add086f596db4596f559a4"],
                choreAssignees: [
                    "63b1ba6da2b164d686b35ae3",
                    "63b1ba96a2b164d686b35af8",
                    "63adcff10e718f3a3e7e65b9",
                ],
                members: [
                    "63adcff10e718f3a3e7e65b9",
                    "63b1ba96a2b164d686b35af8",
                ],
            })
        );
        findOneChore.mockImplementation(() => Promise.resolve(null));

        const response = await request(server)
            .patch("/api/chore/assign/random")
            .send({
                choreId: "63add086f596db4596f559a4",
            })
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            error: true,
            message: "The specified chore does not exist",
        });
    });

    test("A failed random assign chore attempt due to user providing an id for a chore which is completed", async () => {
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
                chores: ["63add086f596db4596f559a4"],
                choreAssignees: [
                    "63b1ba6da2b164d686b35ae3",
                    "63b1ba96a2b164d686b35af8",
                    "63adcff10e718f3a3e7e65b9",
                ],
                members: [
                    "63adcff10e718f3a3e7e65b9",
                    "63b1ba96a2b164d686b35af8",
                ],
            })
        );
        findOneChore.mockImplementation(() =>
            Promise.resolve({
                _id: "63add086f596db4596f559a4",
                assignee: "63b1ba96a2b164d686b35af8",
                assigneeRequestPending: null,
                isCompleted: true,
            })
        );

        const response = await request(server)
            .patch("/api/chore/assign/random")
            .send({
                choreId: "63add086f596db4596f559a4",
            })
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            error: true,
            message: "Cannot assign a chore which has already been completed",
        });
    });

    test("A failed random assign chore attempt due to user providing an id for a chore which is already assigned", async () => {
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
                chores: ["63add086f596db4596f559a4"],
                choreAssignees: [
                    "63b1ba6da2b164d686b35ae3",
                    "63b1ba96a2b164d686b35af8",
                    "63adcff10e718f3a3e7e65b9",
                ],
                members: [
                    "63adcff10e718f3a3e7e65b9",
                    "63b1ba96a2b164d686b35af8",
                ],
            })
        );
        findOneChore.mockImplementation(() =>
            Promise.resolve({
                _id: "63add086f596db4596f559a4",
                assignee: "63b1ba96a2b164d686b35af8",
                assigneeRequestPending: null,
                isCompleted: false,
            })
        );

        const response = await request(server)
            .patch("/api/chore/assign/random")
            .send({
                choreId: "63add086f596db4596f559a4",
            })
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            error: true,
            message: "Cannot assign a chore which is already assigned",
        });
    });

    test("A failed random assign chore attempt due to the specified chore not belonging to the specified household", async () => {
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
                chores: [],
                choreAssignees: [
                    "63b1ba6da2b164d686b35ae3",
                    "63b1ba96a2b164d686b35af8",
                    "63adcff10e718f3a3e7e65b9",
                ],
                members: [
                    "63adcff10e718f3a3e7e65b9",
                    "63b1ba96a2b164d686b35af8",
                ],
            })
        );
        findOneChore.mockImplementation(() =>
            Promise.resolve({
                _id: "63add086f596db4596f559a4",
                assignee: null,
                assigneeRequestPending: null,
                isCompleted: false,
            })
        );

        const response = await request(server)
            .patch("/api/chore/assign/random")
            .send({
                choreId: "63add086f596db4596f559a4",
            })
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            error: true,
            message:
                "The specified chore does not belong to the specified household",
        });
    });

    test("A failed random assign chore attempt due to the specified household not having any available chore assignees", async () => {
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
                chores: ["63add086f596db4596f559a4"],
                choreAssignees: [],
                members: [
                    "63adcff10e718f3a3e7e65b9",
                    "63b1ba96a2b164d686b35af8",
                ],
            })
        );
        findOneChore.mockImplementation(() =>
            Promise.resolve({
                _id: "63add086f596db4596f559a4",
                assignee: null,
                assigneeRequestPending: null,
                isCompleted: false,
            })
        );

        const response = await request(server)
            .patch("/api/chore/assign/random")
            .send({
                choreId: "63add086f596db4596f559a4",
            })
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            error: true,
            message: "There are no assignees available within the household",
        });
    });

    test("A failed random assign chore attempt due to an error occurring during the save notification operation", async () => {
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
                chores: ["63add086f596db4596f559a4"],
                choreAssignees: [
                    "63b1ba6da2b164d686b35ae3",
                    "63b1ba96a2b164d686b35af8",
                    "63adcff10e718f3a3e7e65b9",
                ],
                members: [
                    "63adcff10e718f3a3e7e65b9",
                    "63b1ba96a2b164d686b35af8",
                ],
            })
        );
        findOneChore.mockImplementation(() =>
            Promise.resolve({
                _id: "63add086f596db4596f559a4",
                assignee: null,
                assigneeRequestPending: null,
                isCompleted: false,
            })
        );
        findChoreByIdAndUpdate.mockImplementation(() =>
            Promise.resolve({
                _id: "63add086f596db4596f559a4",
            })
        );
        findHouseholdByIdAndUpdate.mockImplementation(() =>
            Promise.resolve(true)
        );
        saveNotification.mockImplementation(() => {
            throw new Error("Something went wrong");
        });

        const response = await request(server)
            .patch("/api/chore/assign/random")
            .send({
                choreId: "63add086f596db4596f559a4",
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

// Test the self assign chore endpoint with successful requests
describe("Successful self assign chore endpoint tests", () => {
    test("A successful self assign chore attempt", async () => {
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
                chores: ["63add086f596db4596f559a4"],
                choreAssignees: [
                    "63b1ba6da2b164d686b35ae3",
                    "63b1ba96a2b164d686b35af8",
                    "63adcff10e718f3a3e7e65b9",
                ],
            })
        );
        findOneChore.mockImplementation(() =>
            Promise.resolve({
                _id: "63add086f596db4596f559a4",
                isCompleted: false,
            })
        );
        findChoreByIdAndUpdate.mockImplementation(() =>
            Promise.resolve({
                _id: "63add086f596db4596f559a4",
            })
        );
        saveNotification.mockImplementation(() => Promise.resolve(true));
        findUserByIdAndUpdate.mockImplementation(() => Promise.resolve(true));

        const response = await request(server)
            .patch("/api/chore/assign/self")
            .send({
                choreId: "63add086f596db4596f559a4",
            })
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            chore: {
                _id: "63add086f596db4596f559a4",
            },
        });
    });
});

// Test the self assign chore endpoint with failed requests
describe("Failed self assign chore endpoint tests", () => {
    test("A failed self assign chore attempt due to user not belonging to a household", async () => {
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
            .patch("/api/chore/assign/self")
            .send({
                choreId: "63add086f596db4596f559a4",
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

    test("A failed self assign chore attempt due to user not providing a chore id", async () => {
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
                chores: ["63add086f596db4596f559a4"],
                choreAssignees: [
                    "63b1ba6da2b164d686b35ae3",
                    "63b1ba96a2b164d686b35af8",
                    "63adcff10e718f3a3e7e65b9",
                ],
                members: [
                    "63adcff10e718f3a3e7e65b9",
                    "63b1ba96a2b164d686b35af8",
                ],
            })
        );

        const response = await request(server)
            .patch("/api/chore/assign/self")
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            error: true,
            message: "A chore ID was not provided",
        });
    });

    test("A failed self assign chore attempt due to user providing an invalid chore id", async () => {
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
                chores: ["63add086f596db4596f559a4"],
                choreAssignees: [
                    "63b1ba6da2b164d686b35ae3",
                    "63b1ba96a2b164d686b35af8",
                    "63adcff10e718f3a3e7e65b9",
                ],
                members: [
                    "63adcff10e718f3a3e7e65b9",
                    "63b1ba96a2b164d686b35af8",
                ],
            })
        );

        const response = await request(server)
            .patch("/api/chore/assign/self")
            .send({
                choreId: "invalid-chore-id",
            })
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            error: true,
            message: "The provided chore ID is invalid",
        });
    });

    test("A failed self assign chore attempt due to user providing an id for a chore which does not exist", async () => {
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
                chores: ["63add086f596db4596f559a4"],
                choreAssignees: [
                    "63b1ba6da2b164d686b35ae3",
                    "63b1ba96a2b164d686b35af8",
                    "63adcff10e718f3a3e7e65b9",
                ],
                members: [
                    "63adcff10e718f3a3e7e65b9",
                    "63b1ba96a2b164d686b35af8",
                ],
            })
        );
        findOneChore.mockImplementation(() => Promise.resolve(null));

        const response = await request(server)
            .patch("/api/chore/assign/self")
            .send({
                choreId: "63add086f596db4596f559a4",
            })
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            error: true,
            message: "The specified chore does not exist",
        });
    });

    test("A failed self assign chore attempt due to user providing an id for a chore which is completed", async () => {
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
                chores: ["63add086f596db4596f559a4"],
                choreAssignees: [
                    "63b1ba6da2b164d686b35ae3",
                    "63b1ba96a2b164d686b35af8",
                    "63adcff10e718f3a3e7e65b9",
                ],
                members: [
                    "63adcff10e718f3a3e7e65b9",
                    "63b1ba96a2b164d686b35af8",
                ],
            })
        );
        findOneChore.mockImplementation(() =>
            Promise.resolve({
                _id: "63add086f596db4596f559a4",
                assignee: "63b1ba96a2b164d686b35af8",
                assigneeRequestPending: null,
                isCompleted: true,
            })
        );

        const response = await request(server)
            .patch("/api/chore/assign/self")
            .send({
                choreId: "63add086f596db4596f559a4",
            })
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            error: true,
            message: "Cannot assign a chore which has already been completed",
        });
    });

    test("A failed self assign chore attempt due to user providing an id for a chore which is already assigned", async () => {
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
                chores: ["63add086f596db4596f559a4"],
                choreAssignees: [
                    "63b1ba6da2b164d686b35ae3",
                    "63b1ba96a2b164d686b35af8",
                    "63adcff10e718f3a3e7e65b9",
                ],
                members: [
                    "63adcff10e718f3a3e7e65b9",
                    "63b1ba96a2b164d686b35af8",
                ],
            })
        );
        findOneChore.mockImplementation(() =>
            Promise.resolve({
                _id: "63add086f596db4596f559a4",
                assignee: "63b1ba96a2b164d686b35af8",
                assigneeRequestPending: null,
                isCompleted: false,
            })
        );

        const response = await request(server)
            .patch("/api/chore/assign/self")
            .send({
                choreId: "63add086f596db4596f559a4",
            })
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            error: true,
            message: "Cannot assign a chore which is already assigned",
        });
    });

    test("A failed self assign chore attempt due to the specified chore not belonging to the specified household", async () => {
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
                chores: [],
                choreAssignees: [
                    "63b1ba6da2b164d686b35ae3",
                    "63b1ba96a2b164d686b35af8",
                    "63adcff10e718f3a3e7e65b9",
                ],
                members: [
                    "63adcff10e718f3a3e7e65b9",
                    "63b1ba96a2b164d686b35af8",
                ],
            })
        );
        findOneChore.mockImplementation(() =>
            Promise.resolve({
                _id: "63add086f596db4596f559a4",
                assignee: null,
                assigneeRequestPending: null,
                isCompleted: false,
            })
        );

        const response = await request(server)
            .patch("/api/chore/assign/self")
            .send({
                choreId: "63add086f596db4596f559a4",
            })
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            error: true,
            message:
                "The specified chore does not belong to the specified household",
        });
    });

    test("A failed self assign chore attempt due to an error occurring during the save notification operation", async () => {
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
                chores: ["63add086f596db4596f559a4"],
                choreAssignees: [
                    "63b1ba6da2b164d686b35ae3",
                    "63b1ba96a2b164d686b35af8",
                    "63adcff10e718f3a3e7e65b9",
                ],
                members: [
                    "63adcff10e718f3a3e7e65b9",
                    "63b1ba96a2b164d686b35af8",
                ],
            })
        );
        findOneChore.mockImplementation(() =>
            Promise.resolve({
                _id: "63add086f596db4596f559a4",
                assignee: null,
                assigneeRequestPending: null,
                isCompleted: false,
            })
        );
        findChoreByIdAndUpdate.mockImplementation(() =>
            Promise.resolve({
                _id: "63add086f596db4596f559a4",
            })
        );
        saveNotification.mockImplementation(() => {
            throw new Error("Something went wrong");
        });

        const response = await request(server)
            .patch("/api/chore/assign/self")
            .send({
                choreId: "63add086f596db4596f559a4",
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

// Test the assignee request chore endpoint with successful requests
describe("Successful assignee request chore endpoint tests", () => {
    test("A successful assignee request chore attempt where the original assignee is still a member of the household", async () => {
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
                chores: ["63add086f596db4596f559a4"],
                choreAssignees: [
                    "63b1ba6da2b164d686b35ae3",
                    "63b1ba96a2b164d686b35af8",
                    "63adcff10e718f3a3e7e65b9",
                ],
                members: [
                    "63adcff10e718f3a3e7e65b9",
                    "63b1ba96a2b164d686b35af8",
                ],
            })
        );
        findOneChore.mockImplementation(() =>
            Promise.resolve({
                _id: "63add086f596db4596f559a4",
                assignee: "63b1ba96a2b164d686b35af8",
                assigneeRequestPending: null,
                isCompleted: false,
            })
        );
        findChoreByIdAndUpdate.mockImplementation(() =>
            Promise.resolve({
                _id: "63add086f596db4596f559a4",
            })
        );
        saveNotification.mockImplementation(() => Promise.resolve(true));
        findUserByIdAndUpdate.mockImplementation(() => Promise.resolve(true));

        const response = await request(server)
            .patch("/api/chore/assign/request")
            .send({
                choreId: "63add086f596db4596f559a4",
            })
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            chore: {
                _id: "63add086f596db4596f559a4",
            },
        });
    });

    test("A successful assignee request chore attempt where the original assignee is no longer a member of the household", async () => {
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
                chores: ["63add086f596db4596f559a4"],
                choreAssignees: [
                    "63b1ba6da2b164d686b35ae3",
                    "63b1ba96a2b164d686b35af8",
                    "63adcff10e718f3a3e7e65b9",
                ],
                members: ["63adcff10e718f3a3e7e65b9"],
            })
        );
        findOneChore.mockImplementation(() =>
            Promise.resolve({
                _id: "63add086f596db4596f559a4",
                assignee: "63b1ba96a2b164d686b35af8",
                assigneeRequestPending: null,
                isCompleted: false,
            })
        );
        findChoreByIdAndUpdate.mockImplementation(() =>
            Promise.resolve({
                _id: "63add086f596db4596f559a4",
            })
        );

        const response = await request(server)
            .patch("/api/chore/assign/request")
            .send({
                choreId: "63add086f596db4596f559a4",
            })
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            chore: {
                _id: "63add086f596db4596f559a4",
            },
        });
    });
});

// Test the assignee request chore endpoint with failed requests
describe("Failed assignee request chore endpoint tests", () => {
    test("A failed assignee request chore attempt due to user not belonging to a household", async () => {
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
            .patch("/api/chore/assign/request")
            .send({
                choreId: "63add086f596db4596f559a4",
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

    test("A failed assignee request chore attempt due to user not providing a chore id", async () => {
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
                chores: ["63add086f596db4596f559a4"],
                choreAssignees: [
                    "63b1ba6da2b164d686b35ae3",
                    "63b1ba96a2b164d686b35af8",
                    "63adcff10e718f3a3e7e65b9",
                ],
                members: [
                    "63adcff10e718f3a3e7e65b9",
                    "63b1ba96a2b164d686b35af8",
                ],
            })
        );

        const response = await request(server)
            .patch("/api/chore/assign/request")
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            error: true,
            message: "A chore ID was not provided",
        });
    });

    test("A failed assignee request chore attempt due to user providing an invalid chore id", async () => {
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
                chores: ["63add086f596db4596f559a4"],
                choreAssignees: [
                    "63b1ba6da2b164d686b35ae3",
                    "63b1ba96a2b164d686b35af8",
                    "63adcff10e718f3a3e7e65b9",
                ],
                members: [
                    "63adcff10e718f3a3e7e65b9",
                    "63b1ba96a2b164d686b35af8",
                ],
            })
        );

        const response = await request(server)
            .patch("/api/chore/assign/request")
            .send({
                choreId: "invalid-chore-id",
            })
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            error: true,
            message: "The provided chore ID is invalid",
        });
    });

    test("A failed assignee request chore attempt due to user providing an id for a chore which does not exist", async () => {
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
                chores: ["63add086f596db4596f559a4"],
                choreAssignees: [
                    "63b1ba6da2b164d686b35ae3",
                    "63b1ba96a2b164d686b35af8",
                    "63adcff10e718f3a3e7e65b9",
                ],
                members: [
                    "63adcff10e718f3a3e7e65b9",
                    "63b1ba96a2b164d686b35af8",
                ],
            })
        );
        findOneChore.mockImplementation(() => Promise.resolve(null));

        const response = await request(server)
            .patch("/api/chore/assign/request")
            .send({
                choreId: "63add086f596db4596f559a4",
            })
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            error: true,
            message: "The specified chore does not exist",
        });
    });

    test("A failed assignee request chore attempt due to user providing an id for a chore which is completed", async () => {
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
                chores: ["63add086f596db4596f559a4"],
                choreAssignees: [
                    "63b1ba6da2b164d686b35ae3",
                    "63b1ba96a2b164d686b35af8",
                    "63adcff10e718f3a3e7e65b9",
                ],
                members: [
                    "63adcff10e718f3a3e7e65b9",
                    "63b1ba96a2b164d686b35af8",
                ],
            })
        );
        findOneChore.mockImplementation(() =>
            Promise.resolve({
                _id: "63add086f596db4596f559a4",
                assignee: "63b1ba96a2b164d686b35af8",
                assigneeRequestPending: null,
                isCompleted: true,
            })
        );

        const response = await request(server)
            .patch("/api/chore/assign/request")
            .send({
                choreId: "63add086f596db4596f559a4",
            })
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            error: true,
            message:
                "Cannot request assignment for a chore which has already been completed",
        });
    });

    test("A failed assignee request chore attempt due to user providing an id for a chore which is unassigned", async () => {
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
                chores: ["63add086f596db4596f559a4"],
                choreAssignees: [
                    "63b1ba6da2b164d686b35ae3",
                    "63b1ba96a2b164d686b35af8",
                    "63adcff10e718f3a3e7e65b9",
                ],
                members: [
                    "63adcff10e718f3a3e7e65b9",
                    "63b1ba96a2b164d686b35af8",
                ],
            })
        );
        findOneChore.mockImplementation(() =>
            Promise.resolve({
                _id: "63add086f596db4596f559a4",
                assignee: null,
                assigneeRequestPending: null,
                isCompleted: false,
            })
        );

        const response = await request(server)
            .patch("/api/chore/assign/request")
            .send({
                choreId: "63add086f596db4596f559a4",
            })
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            error: true,
            message:
                "Cannot request assignment for a chore which is unassigned",
        });
    });

    test("A failed assignee request chore attempt due to user providing an id for a chore which already has a pending request", async () => {
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
                chores: ["63add086f596db4596f559a4"],
                choreAssignees: [
                    "63b1ba6da2b164d686b35ae3",
                    "63b1ba96a2b164d686b35af8",
                    "63adcff10e718f3a3e7e65b9",
                ],
                members: [
                    "63adcff10e718f3a3e7e65b9",
                    "63b1ba96a2b164d686b35af8",
                ],
            })
        );
        findOneChore.mockImplementation(() =>
            Promise.resolve({
                _id: "63add086f596db4596f559a4",
                assignee: "63b1ba96a2b164d686b35af8",
                assigneeRequestPending: "63b1ba96a2b164d686b35af8",
                isCompleted: false,
            })
        );

        const response = await request(server)
            .patch("/api/chore/assign/request")
            .send({
                choreId: "63add086f596db4596f559a4",
            })
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            error: true,
            message:
                "The specified chore already has a pending assignee request",
        });
    });

    test("A failed assignee request chore attempt due to the requesting user already being the assignee", async () => {
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
                chores: ["63add086f596db4596f559a4"],
                choreAssignees: [
                    "63b1ba6da2b164d686b35ae3",
                    "63b1ba96a2b164d686b35af8",
                    "63adcff10e718f3a3e7e65b9",
                ],
                members: [
                    "63adcff10e718f3a3e7e65b9",
                    "63b1ba96a2b164d686b35af8",
                ],
            })
        );
        findOneChore.mockImplementation(() =>
            Promise.resolve({
                _id: "63add086f596db4596f559a4",
                assignee: "63adcff10e718f3a3e7e65b9",
                assigneeRequestPending: null,
                isCompleted: false,
            })
        );

        const response = await request(server)
            .patch("/api/chore/assign/request")
            .send({
                choreId: "63add086f596db4596f559a4",
            })
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            error: true,
            message:
                "The specified chore is already assigned to the specified user",
        });
    });

    test("A failed assignee request chore attempt due to the specified chore not belonging to the specified household", async () => {
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
                chores: [],
                choreAssignees: [
                    "63b1ba6da2b164d686b35ae3",
                    "63b1ba96a2b164d686b35af8",
                    "63adcff10e718f3a3e7e65b9",
                ],
                members: [
                    "63adcff10e718f3a3e7e65b9",
                    "63b1ba96a2b164d686b35af8",
                ],
            })
        );
        findOneChore.mockImplementation(() =>
            Promise.resolve({
                _id: "63add086f596db4596f559a4",
                assignee: "63b1ba96a2b164d686b35af8",
                assigneeRequestPending: null,
                isCompleted: false,
            })
        );

        const response = await request(server)
            .patch("/api/chore/assign/request")
            .send({
                choreId: "63add086f596db4596f559a4",
            })
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            error: true,
            message:
                "The specified chore does not belong to the specified household",
        });
    });

    test("A failed assignee request chore attempt due to an error occurring during the save notification operation", async () => {
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
                chores: ["63add086f596db4596f559a4"],
                choreAssignees: [
                    "63b1ba6da2b164d686b35ae3",
                    "63b1ba96a2b164d686b35af8",
                    "63adcff10e718f3a3e7e65b9",
                ],
                members: [
                    "63adcff10e718f3a3e7e65b9",
                    "63b1ba96a2b164d686b35af8",
                ],
            })
        );
        findOneChore.mockImplementation(() =>
            Promise.resolve({
                _id: "63add086f596db4596f559a4",
                assignee: "63b1ba96a2b164d686b35af8",
                assigneeRequestPending: null,
                isCompleted: false,
            })
        );
        saveNotification.mockImplementation(() => {
            throw new Error("Something went wrong");
        });

        const response = await request(server)
            .patch("/api/chore/assign/request")
            .send({
                choreId: "63add086f596db4596f559a4",
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

// Test the assignee request response endpoint with successful requests
describe("Successful assignee request response endpoint tests", () => {
    test("A successful assignee request response attempt where the requesting user is still a member of the household", async () => {
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
                chores: ["63add086f596db4596f559a4"],
                choreAssignees: [
                    "63b1ba6da2b164d686b35ae3",
                    "63b1ba96a2b164d686b35af8",
                    "63adcff10e718f3a3e7e65b9",
                ],
                members: [
                    "63adcff10e718f3a3e7e65b9",
                    "63b1ba96a2b164d686b35af8",
                ],
            })
        );
        findOneChore.mockImplementation(() =>
            Promise.resolve({
                _id: "63add086f596db4596f559a4",
                assignee: "63adcff10e718f3a3e7e65b9",
                assigneeRequestPending: "63b1ba96a2b164d686b35af8",
                isCompleted: false,
            })
        );
        findChoreByIdAndUpdate.mockImplementation(() =>
            Promise.resolve({
                _id: "63add086f596db4596f559a4",
            })
        );
        saveNotification.mockImplementation(() => Promise.resolve(true));
        findUserByIdAndUpdate.mockImplementation(() => Promise.resolve(true));

        const response = await request(server)
            .patch("/api/chore/assign/request/respond")
            .send({
                assigneeRequestResponse: "accept",
                choreId: "63add086f596db4596f559a4",
            })
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            chore: {
                _id: "63add086f596db4596f559a4",
            },
        });
    });

    test("A successful assignee request response attempt where the requesting user is no longer a member of the household", async () => {
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
                chores: ["63add086f596db4596f559a4"],
                choreAssignees: [
                    "63b1ba6da2b164d686b35ae3",
                    "63adcff10e718f3a3e7e65b9",
                ],
                members: ["63adcff10e718f3a3e7e65b9"],
            })
        );
        findOneChore.mockImplementation(() =>
            Promise.resolve({
                _id: "63add086f596db4596f559a4",
                assignee: "63adcff10e718f3a3e7e65b9",
                assigneeRequestPending: "63b1ba96a2b164d686b35af8",
                isCompleted: false,
            })
        );
        findChoreByIdAndUpdate.mockImplementation(() =>
            Promise.resolve({
                _id: "63add086f596db4596f559a4",
            })
        );

        const response = await request(server)
            .patch("/api/chore/assign/request/respond")
            .send({
                assigneeRequestResponse: "accept",
                choreId: "63add086f596db4596f559a4",
            })
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            chore: {
                _id: "63add086f596db4596f559a4",
            },
        });
    });
});

// Test the assignee request response chore endpoint with failed requests
describe("Failed assignee request response endpoint tests", () => {
    test("A failed assignee request response attempt due to user not belonging to a household", async () => {
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
            .patch("/api/chore/assign/request/respond")
            .send({
                assigneeRequestResponse: "accept",
                choreId: "63add086f596db4596f559a4",
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

    test("A failed assignee request response attempt due to user providing an invalid response", async () => {
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
                chores: ["63add086f596db4596f559a4"],
                choreAssignees: [
                    "63b1ba6da2b164d686b35ae3",
                    "63b1ba96a2b164d686b35af8",
                    "63adcff10e718f3a3e7e65b9",
                ],
                members: [
                    "63adcff10e718f3a3e7e65b9",
                    "63b1ba96a2b164d686b35af8",
                ],
            })
        );

        const response = await request(server)
            .patch("/api/chore/assign/request/respond")
            .send({
                assigneeRequestResponse: "invalid-response",
                choreId: "63add086f596db4596f559a4",
            })
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            error: true,
            message: "Request response must be 'accept' or 'decline'",
        });
    });

    test("A failed assignee request response attempt due to user not providing a chore id", async () => {
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
                chores: ["63add086f596db4596f559a4"],
                choreAssignees: [
                    "63b1ba6da2b164d686b35ae3",
                    "63b1ba96a2b164d686b35af8",
                    "63adcff10e718f3a3e7e65b9",
                ],
                members: [
                    "63adcff10e718f3a3e7e65b9",
                    "63b1ba96a2b164d686b35af8",
                ],
            })
        );

        const response = await request(server)
            .patch("/api/chore/assign/request/respond")
            .send({
                assigneeRequestResponse: "accept",
            })
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            error: true,
            message: "A chore ID was not provided",
        });
    });

    test("A failed assignee request response attempt due to user providing an invalid chore id", async () => {
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
                chores: ["63add086f596db4596f559a4"],
                choreAssignees: [
                    "63b1ba6da2b164d686b35ae3",
                    "63b1ba96a2b164d686b35af8",
                    "63adcff10e718f3a3e7e65b9",
                ],
                members: [
                    "63adcff10e718f3a3e7e65b9",
                    "63b1ba96a2b164d686b35af8",
                ],
            })
        );

        const response = await request(server)
            .patch("/api/chore/assign/request/respond")
            .send({
                assigneeRequestResponse: "accept",
                choreId: "invalid-chore-id",
            })
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            error: true,
            message: "The provided chore ID is invalid",
        });
    });

    test("A failed assignee request response attempt due to user providing an id for a chore which does not exist", async () => {
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
                chores: ["63add086f596db4596f559a4"],
                choreAssignees: [
                    "63b1ba6da2b164d686b35ae3",
                    "63b1ba96a2b164d686b35af8",
                    "63adcff10e718f3a3e7e65b9",
                ],
                members: [
                    "63adcff10e718f3a3e7e65b9",
                    "63b1ba96a2b164d686b35af8",
                ],
            })
        );
        findOneChore.mockImplementation(() => Promise.resolve(null));

        const response = await request(server)
            .patch("/api/chore/assign/request/respond")
            .send({
                assigneeRequestResponse: "accept",
                choreId: "63add086f596db4596f559a4",
            })
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            error: true,
            message: "The specified chore does not exist",
        });
    });

    test("A failed assignee request response attempt due to user providing an id for a chore which is completed", async () => {
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
                chores: ["63add086f596db4596f559a4"],
                choreAssignees: [
                    "63b1ba6da2b164d686b35ae3",
                    "63b1ba96a2b164d686b35af8",
                    "63adcff10e718f3a3e7e65b9",
                ],
                members: [
                    "63adcff10e718f3a3e7e65b9",
                    "63b1ba96a2b164d686b35af8",
                ],
            })
        );
        findOneChore.mockImplementation(() =>
            Promise.resolve({
                _id: "63add086f596db4596f559a4",
                assignee: "63b1ba96a2b164d686b35af8",
                assigneeRequestPending: null,
                isCompleted: true,
            })
        );

        const response = await request(server)
            .patch("/api/chore/assign/request/respond")
            .send({
                assigneeRequestResponse: "accept",
                choreId: "63add086f596db4596f559a4",
            })
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            error: true,
            message:
                "Cannot alter assignment for a chore which has already been completed",
        });
    });

    test("A failed assignee request response attempt due to user providing an id for a chore which is unassigned", async () => {
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
                chores: ["63add086f596db4596f559a4"],
                choreAssignees: [
                    "63b1ba6da2b164d686b35ae3",
                    "63b1ba96a2b164d686b35af8",
                    "63adcff10e718f3a3e7e65b9",
                ],
                members: [
                    "63adcff10e718f3a3e7e65b9",
                    "63b1ba96a2b164d686b35af8",
                ],
            })
        );
        findOneChore.mockImplementation(() =>
            Promise.resolve({
                _id: "63add086f596db4596f559a4",
                assignee: null,
                assigneeRequestPending: null,
                isCompleted: false,
            })
        );

        const response = await request(server)
            .patch("/api/chore/assign/request/respond")
            .send({
                assigneeRequestResponse: "accept",
                choreId: "63add086f596db4596f559a4",
            })
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            error: true,
            message:
                "Cannot request assignment for a chore which is unassigned",
        });
    });

    test("A failed assignee request response attempt due to user providing an id for a chore which does not have a pending request", async () => {
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
                chores: ["63add086f596db4596f559a4"],
                choreAssignees: [
                    "63b1ba6da2b164d686b35ae3",
                    "63b1ba96a2b164d686b35af8",
                    "63adcff10e718f3a3e7e65b9",
                ],
                members: [
                    "63adcff10e718f3a3e7e65b9",
                    "63b1ba96a2b164d686b35af8",
                ],
            })
        );
        findOneChore.mockImplementation(() =>
            Promise.resolve({
                _id: "63add086f596db4596f559a4",
                assignee: "63b1ba96a2b164d686b35af8",
                assigneeRequestPending: null,
                isCompleted: false,
            })
        );

        const response = await request(server)
            .patch("/api/chore/assign/request/respond")
            .send({
                assigneeRequestResponse: "accept",
                choreId: "63add086f596db4596f559a4",
            })
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            error: true,
            message:
                "The specified chore does not have a pending assignee request",
        });
    });

    test("A failed assignee request response attempt due to user providing an id for a chore which is already assigned to them", async () => {
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
                chores: ["63add086f596db4596f559a4"],
                choreAssignees: [
                    "63b1ba6da2b164d686b35ae3",
                    "63b1ba96a2b164d686b35af8",
                    "63adcff10e718f3a3e7e65b9",
                ],
                members: [
                    "63adcff10e718f3a3e7e65b9",
                    "63b1ba96a2b164d686b35af8",
                ],
            })
        );
        findOneChore.mockImplementation(() =>
            Promise.resolve({
                _id: "63add086f596db4596f559a4",
                assignee: "63b1ba96a2b164d686b35af8",
                assigneeRequestPending: "63b1ba96a2b164d686b35af8",
                isCompleted: false,
            })
        );

        const response = await request(server)
            .patch("/api/chore/assign/request/respond")
            .send({
                assigneeRequestResponse: "accept",
                choreId: "63add086f596db4596f559a4",
            })
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            error: true,
            message:
                "The specified chore is already assigned to the requesting user",
        });
    });

    test("A failed assignee request response attempt due to the specified chore not belonging to the specified household", async () => {
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
                chores: [],
                choreAssignees: [
                    "63b1ba6da2b164d686b35ae3",
                    "63b1ba96a2b164d686b35af8",
                    "63adcff10e718f3a3e7e65b9",
                ],
                members: [
                    "63adcff10e718f3a3e7e65b9",
                    "63b1ba96a2b164d686b35af8",
                ],
            })
        );
        findOneChore.mockImplementation(() =>
            Promise.resolve({
                _id: "63add086f596db4596f559a4",
                assignee: "63adcff10e718f3a3e7e65b9",
                assigneeRequestPending: "63b1ba96a2b164d686b35af8",
                isCompleted: false,
            })
        );

        const response = await request(server)
            .patch("/api/chore/assign/request/respond")
            .send({
                assigneeRequestResponse: "accept",
                choreId: "63add086f596db4596f559a4",
            })
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            error: true,
            message:
                "The specified chore does not belong to the specified household",
        });
    });

    test("A failed assignee request response attempt due to an error occurring during the save notification operation", async () => {
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
                chores: ["63add086f596db4596f559a4"],
                choreAssignees: [
                    "63b1ba6da2b164d686b35ae3",
                    "63b1ba96a2b164d686b35af8",
                    "63adcff10e718f3a3e7e65b9",
                ],
                members: [
                    "63adcff10e718f3a3e7e65b9",
                    "63b1ba96a2b164d686b35af8",
                ],
            })
        );
        findOneChore.mockImplementation(() =>
            Promise.resolve({
                _id: "63add086f596db4596f559a4",
                assignee: "63adcff10e718f3a3e7e65b9",
                assigneeRequestPending: "63b1ba96a2b164d686b35af8",
                isCompleted: false,
            })
        );
        findChoreByIdAndUpdate.mockImplementation(() =>
            Promise.resolve({
                _id: "63add086f596db4596f559a4",
            })
        );
        saveNotification.mockImplementation(() => {
            throw new Error("Something went wrong");
        });

        const response = await request(server)
            .patch("/api/chore/assign/request/respond")
            .send({
                assigneeRequestResponse: "decline",
                choreId: "63add086f596db4596f559a4",
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

// Test the complete chore endpoint with successful requests
describe("Successful complete chore endpoint tests", () => {
    test("A successful complete chore attempt where the chore is the first to be completed within the household", async () => {
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
                chores: ["63add086f596db4596f559a4"],
                choreAssignees: [
                    "63b1ba6da2b164d686b35ae3",
                    "63b1ba96a2b164d686b35af8",
                    "63adcff10e718f3a3e7e65b9",
                ],
                members: [
                    "63adcff10e718f3a3e7e65b9",
                    "63b1ba96a2b164d686b35af8",
                ],
            })
        );
        findOneChore.mockImplementation(() =>
            Promise.resolve({
                _id: "63add086f596db4596f559a4",
                isCompleted: false,
            })
        );
        findChoreByIdAndUpdate.mockImplementation(() =>
            Promise.resolve({
                _id: "63add086f596db4596f559a4",
            })
        );
        findHouseholdByIdAndUpdate.mockImplementation(() =>
            Promise.resolve(true)
        );
        saveNotification.mockImplementation(() => Promise.resolve(true));
        updateManyUser.mockImplementation(() => Promise.resolve(true));

        const response = await request(server)
            .patch("/api/chore/complete")
            .send({
                choreId: "63add086f596db4596f559a4",
            })
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            chore: {
                _id: "63add086f596db4596f559a4",
            },
        });
    });

    test("A successful complete chore attempt where the chore streak is reset to 1", async () => {
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
                chores: ["63add086f596db4596f559a4"],
                choreAssignees: [
                    "63b1ba6da2b164d686b35ae3",
                    "63b1ba96a2b164d686b35af8",
                    "63adcff10e718f3a3e7e65b9",
                ],
                members: [
                    "63adcff10e718f3a3e7e65b9",
                    "63b1ba96a2b164d686b35af8",
                ],
                lastCompletedChoreDate: "2023-01-23T13:32:41.676+00:00",
            })
        );
        findOneChore.mockImplementation(() =>
            Promise.resolve({
                _id: "63add086f596db4596f559a4",
                isCompleted: false,
            })
        );
        findChoreByIdAndUpdate.mockImplementation(() =>
            Promise.resolve({
                _id: "63add086f596db4596f559a4",
            })
        );
        findHouseholdByIdAndUpdate.mockImplementation(() =>
            Promise.resolve(true)
        );
        saveNotification.mockImplementation(() => Promise.resolve(true));
        updateManyUser.mockImplementation(() => Promise.resolve(true));

        const response = await request(server)
            .patch("/api/chore/complete")
            .send({
                choreId: "63add086f596db4596f559a4",
            })
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            chore: {
                _id: "63add086f596db4596f559a4",
            },
        });
    });

    test("A successful complete chore attempt where the chore streak is incremented", async () => {
        // Get yesterdays date
        var yesterday = Date.now();
        yesterday = new Date(yesterday);
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);

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
                chores: ["63add086f596db4596f559a4"],
                choreAssignees: [
                    "63b1ba6da2b164d686b35ae3",
                    "63b1ba96a2b164d686b35af8",
                    "63adcff10e718f3a3e7e65b9",
                ],
                members: [
                    "63adcff10e718f3a3e7e65b9",
                    "63b1ba96a2b164d686b35af8",
                ],
                lastCompletedChoreDate: yesterday.toString(),
            })
        );
        findOneChore.mockImplementation(() =>
            Promise.resolve({
                _id: "63add086f596db4596f559a4",
                isCompleted: false,
            })
        );
        findChoreByIdAndUpdate.mockImplementation(() =>
            Promise.resolve({
                _id: "63add086f596db4596f559a4",
            })
        );
        findHouseholdByIdAndUpdate.mockImplementation(() =>
            Promise.resolve(true)
        );
        saveNotification.mockImplementation(() => Promise.resolve(true));
        updateManyUser.mockImplementation(() => Promise.resolve(true));

        const response = await request(server)
            .patch("/api/chore/complete")
            .send({
                choreId: "63add086f596db4596f559a4",
            })
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            chore: {
                _id: "63add086f596db4596f559a4",
            },
        });
    });
});

// Test the complete chore endpoint with failed requests
describe("Failed complete chore endpoint tests", () => {
    test("A failed complete chore attempt due to user not belonging to a household", async () => {
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
            .patch("/api/chore/complete")
            .send({
                choreId: "63add086f596db4596f559a4",
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

    test("A failed complete chore attempt due to user not providing a chore id", async () => {
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
                chores: ["63add086f596db4596f559a4"],
                choreAssignees: [
                    "63b1ba6da2b164d686b35ae3",
                    "63b1ba96a2b164d686b35af8",
                    "63adcff10e718f3a3e7e65b9",
                ],
                members: [
                    "63adcff10e718f3a3e7e65b9",
                    "63b1ba96a2b164d686b35af8",
                ],
            })
        );

        const response = await request(server)
            .patch("/api/chore/complete")
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            error: true,
            message: "A chore ID was not provided",
        });
    });

    test("A failed complete chore attempt due to user providing an invalid chore id", async () => {
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
                chores: ["63add086f596db4596f559a4"],
                choreAssignees: [
                    "63b1ba6da2b164d686b35ae3",
                    "63b1ba96a2b164d686b35af8",
                    "63adcff10e718f3a3e7e65b9",
                ],
                members: [
                    "63adcff10e718f3a3e7e65b9",
                    "63b1ba96a2b164d686b35af8",
                ],
            })
        );

        const response = await request(server)
            .patch("/api/chore/complete")
            .send({
                choreId: "not-a-real-id",
            })
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            error: true,
            message: "The provided chore ID is invalid",
        });
    });

    test("A failed complete chore attempt due to user providing an id for a chore which does not exist", async () => {
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
                chores: ["63add086f596db4596f559a4"],
                choreAssignees: [
                    "63b1ba6da2b164d686b35ae3",
                    "63b1ba96a2b164d686b35af8",
                    "63adcff10e718f3a3e7e65b9",
                ],
                members: [
                    "63adcff10e718f3a3e7e65b9",
                    "63b1ba96a2b164d686b35af8",
                ],
            })
        );
        findOneChore.mockImplementation(() => Promise.resolve(null));

        const response = await request(server)
            .patch("/api/chore/complete")
            .send({
                choreId: "63add086f596db4596f559a4",
            })
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            error: true,
            message: "The specified chore does not exist",
        });
    });

    test("A failed complete chore attempt due to user providing an id for a chore which is completed", async () => {
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
                chores: ["63add086f596db4596f559a4"],
                choreAssignees: [
                    "63b1ba6da2b164d686b35ae3",
                    "63b1ba96a2b164d686b35af8",
                    "63adcff10e718f3a3e7e65b9",
                ],
                members: [
                    "63adcff10e718f3a3e7e65b9",
                    "63b1ba96a2b164d686b35af8",
                ],
            })
        );
        findOneChore.mockImplementation(() =>
            Promise.resolve({
                _id: "63add086f596db4596f559a4",
                isCompleted: true,
            })
        );

        const response = await request(server)
            .patch("/api/chore/complete")
            .send({
                choreId: "63add086f596db4596f559a4",
            })
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            error: true,
            message: "The specified chore has already been completed",
        });
    });

    test("A failed complete chore attempt due to the specified chore not belonging to the specified household", async () => {
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
                chores: [],
                choreAssignees: [
                    "63b1ba6da2b164d686b35ae3",
                    "63b1ba96a2b164d686b35af8",
                    "63adcff10e718f3a3e7e65b9",
                ],
                members: [
                    "63adcff10e718f3a3e7e65b9",
                    "63b1ba96a2b164d686b35af8",
                ],
            })
        );
        findOneChore.mockImplementation(() =>
            Promise.resolve({
                _id: "63add086f596db4596f559a4",
                isCompleted: false,
            })
        );

        const response = await request(server)
            .patch("/api/chore/complete")
            .send({
                choreId: "63add086f596db4596f559a4",
            })
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            error: true,
            message:
                "The specified chore does not belong to the specified household",
        });
    });

    test("A failed complete chore attempt due to an error occurring during the save notification operation", async () => {
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
                chores: ["63add086f596db4596f559a4"],
                choreAssignees: [
                    "63b1ba6da2b164d686b35ae3",
                    "63b1ba96a2b164d686b35af8",
                    "63adcff10e718f3a3e7e65b9",
                ],
                members: [
                    "63adcff10e718f3a3e7e65b9",
                    "63b1ba96a2b164d686b35af8",
                ],
            })
        );
        findOneChore.mockImplementation(() =>
            Promise.resolve({
                _id: "63add086f596db4596f559a4",
                isCompleted: false,
            })
        );
        findChoreByIdAndUpdate.mockImplementation(() =>
            Promise.resolve({
                _id: "63add086f596db4596f559a4",
            })
        );
        findHouseholdByIdAndUpdate.mockImplementation(() =>
            Promise.resolve(true)
        );
        saveNotification.mockImplementation(() => {
            throw new Error("Something went wrong");
        });

        const response = await request(server)
            .patch("/api/chore/complete")
            .send({
                choreId: "63add086f596db4596f559a4",
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

// Test the delete chore endpoint with successful requests
describe("Successful delete chore endpoint tests", () => {
    test("A successful delete chore attempt", async () => {
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
                chores: ["63add086f596db4596f559a4"],
                choreAssignees: [
                    "63b1ba6da2b164d686b35ae3",
                    "63b1ba96a2b164d686b35af8",
                    "63adcff10e718f3a3e7e65b9",
                ],
                members: [
                    "63adcff10e718f3a3e7e65b9",
                    "63b1ba96a2b164d686b35af8",
                ],
            })
        );
        findOneChore.mockImplementation(() =>
            Promise.resolve({
                _id: "63add086f596db4596f559a4",
                isCompleted: false,
            })
        );
        deleteOneChore.mockImplementation(() => Promise.resolve(true));
        findHouseholdByIdAndUpdate.mockImplementation(() =>
            Promise.resolve(true)
        );

        const response = await request(server)
            .delete("/api/chore?choreId=63add086f596db4596f559a4")
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            chore: "Chore deleted successfully",
        });
    });
});

// Test the delete chore endpoint with failed requests
describe("Failed delete chore endpoint tests", () => {
    test("A failed delete chore attempt due to user not belonging to a household", async () => {
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
            .delete("/api/chore?choreId=63add086f596db4596f559a4")
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

    test("A failed delete chore attempt due to user not providing a chore id", async () => {
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
                chores: ["63add086f596db4596f559a4"],
                choreAssignees: [
                    "63b1ba6da2b164d686b35ae3",
                    "63b1ba96a2b164d686b35af8",
                    "63adcff10e718f3a3e7e65b9",
                ],
                members: [
                    "63adcff10e718f3a3e7e65b9",
                    "63b1ba96a2b164d686b35af8",
                ],
            })
        );

        const response = await request(server)
            .delete("/api/chore")
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            error: true,
            message: "A chore ID was not provided",
        });
    });

    test("A failed delete chore attempt due to user providing an invalid chore id", async () => {
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
                chores: ["63add086f596db4596f559a4"],
                choreAssignees: [
                    "63b1ba6da2b164d686b35ae3",
                    "63b1ba96a2b164d686b35af8",
                    "63adcff10e718f3a3e7e65b9",
                ],
                members: [
                    "63adcff10e718f3a3e7e65b9",
                    "63b1ba96a2b164d686b35af8",
                ],
            })
        );

        const response = await request(server)
            .delete("/api/chore?choreId=not-a-real-id")
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            error: true,
            message: "The provided chore ID is invalid",
        });
    });

    test("A failed delete chore attempt due to user providing an id for a chore which does not exist", async () => {
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
                chores: ["63add086f596db4596f559a4"],
                choreAssignees: [
                    "63b1ba6da2b164d686b35ae3",
                    "63b1ba96a2b164d686b35af8",
                    "63adcff10e718f3a3e7e65b9",
                ],
                members: [
                    "63adcff10e718f3a3e7e65b9",
                    "63b1ba96a2b164d686b35af8",
                ],
            })
        );
        findOneChore.mockImplementation(() => Promise.resolve(null));

        const response = await request(server)
            .delete("/api/chore?choreId=63add086f596db4596f559a4")
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            error: true,
            message: "The specified chore does not exist",
        });
    });

    test("A failed delete chore attempt due to the specified chore not belonging to the specified household", async () => {
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
                chores: [],
                choreAssignees: [
                    "63b1ba6da2b164d686b35ae3",
                    "63b1ba96a2b164d686b35af8",
                    "63adcff10e718f3a3e7e65b9",
                ],
                members: [
                    "63adcff10e718f3a3e7e65b9",
                    "63b1ba96a2b164d686b35af8",
                ],
            })
        );
        findOneChore.mockImplementation(() =>
            Promise.resolve({
                _id: "63add086f596db4596f559a4",
                isCompleted: false,
                assignee: "63adcff10e718f3a3e7e65b9",
            })
        );

        const response = await request(server)
            .delete("/api/chore?choreId=63add086f596db4596f559a4")
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            error: true,
            message:
                "The specified chore does not belong to the specified household",
        });
    });

    test("A failed delete chore attempt due to an error occurring during the delete operation", async () => {
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
                chores: ["63add086f596db4596f559a4"],
                choreAssignees: [
                    "63b1ba6da2b164d686b35ae3",
                    "63b1ba96a2b164d686b35af8",
                    "63adcff10e718f3a3e7e65b9",
                ],
                members: [
                    "63adcff10e718f3a3e7e65b9",
                    "63b1ba96a2b164d686b35af8",
                ],
            })
        );
        findOneChore.mockImplementation(() =>
            Promise.resolve({
                _id: "63add086f596db4596f559a4",
                isCompleted: false,
                assignee: "63adcff10e718f3a3e7e65b9",
            })
        );
        deleteOneChore.mockImplementation(() => {
            throw new Error("Something went wrong");
        });

        const response = await request(server)
            .delete("/api/chore?choreId=63add086f596db4596f559a4")
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

// Test the decline chore assignment endpoint with successful requests
describe("Successful decline chore assignment endpoint tests", () => {
    test("A successful decline chore assignment attempt where the chore does not have a pending assignee request", async () => {
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
                chores: ["63add086f596db4596f559a4"],
                choreAssignees: [
                    "63b1ba6da2b164d686b35ae3",
                    "63b1ba96a2b164d686b35af8",
                    "63adcff10e718f3a3e7e65b9",
                ],
                members: [
                    "63adcff10e718f3a3e7e65b9",
                    "63b1ba96a2b164d686b35af8",
                ],
            })
        );
        findOneChore.mockImplementation(() =>
            Promise.resolve({
                _id: "63add086f596db4596f559a4",
                isCompleted: false,
                assignee: "63adcff10e718f3a3e7e65b9",
            })
        );
        findChoreByIdAndUpdate.mockImplementation(() =>
            Promise.resolve({
                _id: "63add086f596db4596f559a4",
            })
        );
        saveNotification.mockImplementation(() => Promise.resolve(true));
        updateManyUser.mockImplementation(() => Promise.resolve(true));

        const response = await request(server)
            .patch("/api/chore/assign/random/decline")
            .send({
                choreId: "63add086f596db4596f559a4",
                reason: "I can't do this chore because I need to study for my exam tomorrow!",
            })
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            chore: {
                _id: "63add086f596db4596f559a4",
            },
        });
    });

    test("A successful decline chore assignment attempt where the chore has a pending assignee request", async () => {
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
                chores: ["63add086f596db4596f559a4"],
                choreAssignees: [
                    "63b1ba6da2b164d686b35ae3",
                    "63b1ba96a2b164d686b35af8",
                    "63adcff10e718f3a3e7e65b9",
                ],
                members: [
                    "63adcff10e718f3a3e7e65b9",
                    "63b1ba96a2b164d686b35af8",
                ],
            })
        );
        findOneChore.mockImplementation(() =>
            Promise.resolve({
                _id: "63add086f596db4596f559a4",
                isCompleted: false,
                assignee: "63adcff10e718f3a3e7e65b9",
                assigneeRequestPending: "63b1ba96a2b164d686b35af8",
            })
        );
        findChoreByIdAndUpdate.mockImplementation(() =>
            Promise.resolve({
                _id: "63add086f596db4596f559a4",
            })
        );
        saveNotification.mockImplementation(() => Promise.resolve(true));
        updateManyUser.mockImplementation(() => Promise.resolve(true));
        findUserByIdAndUpdate.mockImplementation(() => Promise.resolve(true));

        const response = await request(server)
            .patch("/api/chore/assign/random/decline")
            .send({
                choreId: "63add086f596db4596f559a4",
                reason: "I can't do this chore because I need to study for my exam tomorrow!",
            })
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            chore: {
                _id: "63add086f596db4596f559a4",
            },
        });
    });
});

// Test the decline chore assignment endpoint with failed requests
describe("Failed decline chore assignment endpoint tests", () => {
    test("A failed decline chore assignment attempt due to user not belonging to a household", async () => {
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
            .patch("/api/chore/assign/random/decline")
            .send({
                choreId: "63add086f596db4596f559a4",
                reason: "I can't do this chore because I need to study for my exam tomorrow!",
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

    test("A failed decline chore assignment attempt due to user not providing a reason for declining", async () => {
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
                chores: ["63add086f596db4596f559a4"],
                choreAssignees: [
                    "63b1ba6da2b164d686b35ae3",
                    "63b1ba96a2b164d686b35af8",
                    "63adcff10e718f3a3e7e65b9",
                ],
                members: [
                    "63adcff10e718f3a3e7e65b9",
                    "63b1ba96a2b164d686b35af8",
                ],
            })
        );

        const response = await request(server)
            .patch("/api/chore/assign/random/decline")
            .send({
                choreId: "63add086f596db4596f559a4",
            })
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            error: true,
            message:
                "A reason must be provided to decline a random chore assignment",
        });
    });

    test("A failed decline chore assignment attempt due to user not providing a chore id", async () => {
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
                chores: ["63add086f596db4596f559a4"],
                choreAssignees: [
                    "63b1ba6da2b164d686b35ae3",
                    "63b1ba96a2b164d686b35af8",
                    "63adcff10e718f3a3e7e65b9",
                ],
                members: [
                    "63adcff10e718f3a3e7e65b9",
                    "63b1ba96a2b164d686b35af8",
                ],
            })
        );

        const response = await request(server)
            .patch("/api/chore/assign/random/decline")
            .send({
                reason: "I have too many things going on right now",
            })
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            error: true,
            message: "A chore ID was not provided",
        });
    });

    test("A failed decline chore assignment attempt due to user providing an invalid chore id", async () => {
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
                chores: ["63add086f596db4596f559a4"],
                choreAssignees: [
                    "63b1ba6da2b164d686b35ae3",
                    "63b1ba96a2b164d686b35af8",
                    "63adcff10e718f3a3e7e65b9",
                ],
                members: [
                    "63adcff10e718f3a3e7e65b9",
                    "63b1ba96a2b164d686b35af8",
                ],
            })
        );

        const response = await request(server)
            .patch("/api/chore/assign/random/decline")
            .send({
                choreId: "not-a-real-id",
                reason: "I have too many things going on right now",
            })
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            error: true,
            message: "The provided chore ID is invalid",
        });
    });

    test("A failed decline chore assignment attempt due to user providing an id for a chore which does not exist", async () => {
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
                chores: ["63add086f596db4596f559a4"],
                choreAssignees: [
                    "63b1ba6da2b164d686b35ae3",
                    "63b1ba96a2b164d686b35af8",
                    "63adcff10e718f3a3e7e65b9",
                ],
                members: [
                    "63adcff10e718f3a3e7e65b9",
                    "63b1ba96a2b164d686b35af8",
                ],
            })
        );
        findOneChore.mockImplementation(() => Promise.resolve(null));

        const response = await request(server)
            .patch("/api/chore/assign/random/decline")
            .send({
                choreId: "63add086f596db4596f559a4",
                reason: "I have too many things going on right now",
            })
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            error: true,
            message: "The specified chore does not exist",
        });
    });

    test("A failed decline chore assignment attempt due to user providing an id for a chore which is completed", async () => {
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
                chores: ["63add086f596db4596f559a4"],
                choreAssignees: [
                    "63b1ba6da2b164d686b35ae3",
                    "63b1ba96a2b164d686b35af8",
                    "63adcff10e718f3a3e7e65b9",
                ],
                members: [
                    "63adcff10e718f3a3e7e65b9",
                    "63b1ba96a2b164d686b35af8",
                ],
            })
        );
        findOneChore.mockImplementation(() =>
            Promise.resolve({
                _id: "63add086f596db4596f559a4",
                isCompleted: true,
            })
        );

        const response = await request(server)
            .patch("/api/chore/assign/random/decline")
            .send({
                choreId: "63add086f596db4596f559a4",
                reason: "I have too many things going on right now",
            })
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            error: true,
            message:
                "Cannot alter assignment for a chore which has already been completed",
        });
    });

    test("A failed decline chore assignment attempt due to user providing an id for a chore which is unassigned", async () => {
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
                chores: ["63add086f596db4596f559a4"],
                choreAssignees: [
                    "63b1ba6da2b164d686b35ae3",
                    "63b1ba96a2b164d686b35af8",
                    "63adcff10e718f3a3e7e65b9",
                ],
                members: [
                    "63adcff10e718f3a3e7e65b9",
                    "63b1ba96a2b164d686b35af8",
                ],
            })
        );
        findOneChore.mockImplementation(() =>
            Promise.resolve({
                _id: "63add086f596db4596f559a4",
                isCompleted: false,
                assignee: null,
            })
        );

        const response = await request(server)
            .patch("/api/chore/assign/random/decline")
            .send({
                choreId: "63add086f596db4596f559a4",
                reason: "I have too many things going on right now",
            })
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            error: true,
            message:
                "Cannot decline assignment for a chore which is unassigned",
        });
    });

    test("A failed decline chore assignment attempt due to the specified user not being assigned to the specified chore", async () => {
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
                chores: ["63add086f596db4596f559a4"],
                choreAssignees: [
                    "63b1ba6da2b164d686b35ae3",
                    "63b1ba96a2b164d686b35af8",
                    "63adcff10e718f3a3e7e65b9",
                ],
                members: [
                    "63adcff10e718f3a3e7e65b9",
                    "63b1ba96a2b164d686b35af8",
                ],
            })
        );
        findOneChore.mockImplementation(() =>
            Promise.resolve({
                _id: "63add086f596db4596f559a4",
                isCompleted: false,
                assignee: "63b1ba96a2b164d686b35af8",
            })
        );

        const response = await request(server)
            .patch("/api/chore/assign/random/decline")
            .send({
                choreId: "63add086f596db4596f559a4",
                reason: "I have too many things going on right now",
            })
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            error: true,
            message:
                "The specified user is not assigned to the specified chore",
        });
    });

    test("A failed decline chore assignment attempt due to the specified chore not belonging to the specified household", async () => {
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
                chores: [],
                choreAssignees: [
                    "63b1ba6da2b164d686b35ae3",
                    "63b1ba96a2b164d686b35af8",
                    "63adcff10e718f3a3e7e65b9",
                ],
                members: [
                    "63adcff10e718f3a3e7e65b9",
                    "63b1ba96a2b164d686b35af8",
                ],
            })
        );
        findOneChore.mockImplementation(() =>
            Promise.resolve({
                _id: "63add086f596db4596f559a4",
                isCompleted: false,
                assignee: "63adcff10e718f3a3e7e65b9",
            })
        );

        const response = await request(server)
            .patch("/api/chore/assign/random/decline")
            .send({
                choreId: "63add086f596db4596f559a4",
                reason: "I have too many things going on right now",
            })
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            error: true,
            message:
                "The specified chore does not belong to the specified household",
        });
    });

    test("A failed decline chore assignment attempt due to an error occurring during the first save notification operation", async () => {
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
                chores: ["63add086f596db4596f559a4"],
                choreAssignees: [
                    "63b1ba6da2b164d686b35ae3",
                    "63b1ba96a2b164d686b35af8",
                    "63adcff10e718f3a3e7e65b9",
                ],
                members: [
                    "63adcff10e718f3a3e7e65b9",
                    "63b1ba96a2b164d686b35af8",
                ],
            })
        );
        findOneChore.mockImplementation(() =>
            Promise.resolve({
                _id: "63add086f596db4596f559a4",
                isCompleted: false,
                assignee: "63adcff10e718f3a3e7e65b9",
            })
        );
        findChoreByIdAndUpdate.mockImplementation(() =>
            Promise.resolve({
                _id: "63add086f596db4596f559a4",
            })
        );
        saveNotification.mockImplementation(() => {
            throw new Error("Something went wrong");
        });

        const response = await request(server)
            .patch("/api/chore/assign/random/decline")
            .send({
                choreId: "63add086f596db4596f559a4",
                reason: "I have too many things going on right now",
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

    test("A failed decline chore assignment attempt due to an error occurring during the second save notification operation", async () => {
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
                chores: ["63add086f596db4596f559a4"],
                choreAssignees: [
                    "63b1ba6da2b164d686b35ae3",
                    "63b1ba96a2b164d686b35af8",
                    "63adcff10e718f3a3e7e65b9",
                ],
                members: [
                    "63adcff10e718f3a3e7e65b9",
                    "63b1ba96a2b164d686b35af8",
                ],
            })
        );
        findOneChore.mockImplementation(() =>
            Promise.resolve({
                _id: "63add086f596db4596f559a4",
                isCompleted: false,
                assignee: "63adcff10e718f3a3e7e65b9",
                assigneeRequestPending: "63b1ba96a2b164d686b35af8",
            })
        );
        findChoreByIdAndUpdate.mockImplementation(() =>
            Promise.resolve({
                _id: "63add086f596db4596f559a4",
            })
        );
        saveNotification
            .mockReturnValueOnce(Promise.resolve(true))
            .mockImplementation(() => {
                throw new Error("Something went wrong");
            });
        updateManyUser.mockImplementation(() => Promise.resolve(true));

        const response = await request(server)
            .patch("/api/chore/assign/random/decline")
            .send({
                choreId: "63add086f596db4596f559a4",
                reason: "I have too many things going on right now",
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
