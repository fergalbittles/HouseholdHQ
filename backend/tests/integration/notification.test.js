const request = require("supertest");
const server = require("../../index");
const mongoose = require("mongoose");
const User = require("../../model/User");
const Notification = require("../../model/Notification");
const Household = require("../../model/Household");

// Mock database queries
const findOneUser = jest.spyOn(User, "findOne");
const findUserByIdAndUpdate = jest.spyOn(User, "findByIdAndUpdate");
const findOneHousehold = jest.spyOn(Household, "findOne");
const findNotification = jest.spyOn(Notification, "find");
const findOneNotification = jest.spyOn(Notification, "findOne");
const findNotificationByIdAndUpdate = jest.spyOn(
    Notification,
    "findByIdAndUpdate"
);

// Open database connection before each test
beforeAll(() => {
    mongoose.connect(process.env.DB_CONNECT);
});

// Close database connection after all tests
afterAll(async () => {
    await findOneHousehold.mockRestore();
    await findOneUser.mockRestore();
    await findUserByIdAndUpdate.mockRestore();
    await findNotification.mockRestore();
    await findOneNotification.mockRestore();
    await findNotificationByIdAndUpdate.mockRestore();
    await mongoose.connection.close();
});

// Test the get notifications endpoint with successful requests
describe("Successful get notifications endpoint tests", () => {
    test("A successful get notifications attempt", async () => {
        findOneUser.mockImplementation(() =>
            Promise.resolve({
                _id: "63adcff10e718f3a3e7e65b9",
                email: "john_doe@email.com",
                password:
                    "$2a$10$uxdgbAZ0qu5oA1W574etDeGWukVsrOLCkZc0e/IFaronBO3gtBBza",
                householdID: "63adcff10e728f3a3e5e65b7",
                name: "John Doe",
                date: "2022-12-30T14:00:28.108Z",
                notifications: [
                    "63adcff10e718f3a3e7e65b7",
                    "63b1ba6da2b164d686b35ae6",
                    "63b1ba96a2b164d686b35af5",
                ],
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
        findNotification.mockImplementation(() =>
            Promise.resolve([
                { _id: "63adcff10e718f3a3e7e65b7" },
                { _id: "63b1ba6da2b164d686b35ae6" },
                { _id: "63b1ba96a2b164d686b35af5" },
            ])
        );

        const response = await request(server)
            .get("/api/notification")
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            notifications: [
                { _id: "63adcff10e718f3a3e7e65b7" },
                { _id: "63b1ba6da2b164d686b35ae6" },
                { _id: "63b1ba96a2b164d686b35af5" },
            ],
        });
    });
});

// Test the get notifications endpoint with failed requests
describe("Failed get notifications endpoint tests", () => {
    test("A failed get notifications attempt due to user not belonging to a household", async () => {
        findOneUser.mockImplementation(() =>
            Promise.resolve({
                _id: "63adcff10e718f3a3e7e65b9",
                email: "john_doe@email.com",
                password:
                    "$2a$10$uxdgbAZ0qu5oA1W574etDeGWukVsrOLCkZc0e/IFaronBO3gtBBza",
                householdID: null,
                name: "John Doe",
                date: "2022-12-30T14:00:28.108Z",
            })
        );
        findOneHousehold.mockImplementation(() => Promise.resolve(null));

        const response = await request(server)
            .get("/api/notification")
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

// Test the delete notifications endpoint with successful requests
describe("Successful delete notifications endpoint tests", () => {
    test("A successful delete notifications attempt", async () => {
        findOneUser.mockImplementation(() =>
            Promise.resolve({
                _id: "63adcff10e718f3a3e7e65b9",
                email: "john_doe@email.com",
                password:
                    "$2a$10$uxdgbAZ0qu5oA1W574etDeGWukVsrOLCkZc0e/IFaronBO3gtBBza",
                householdID: "63adcff10e728f3a3e5e65b7",
                name: "John Doe",
                date: "2022-12-30T14:00:28.108Z",
                notifications: [
                    "63adcff10e718f3a3e7e65b7",
                    "63b1ba6da2b164d686b35ae6",
                    "63b1ba96a2b164d686b35af5",
                ],
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
        findUserByIdAndUpdate.mockImplementation(() => Promise.resolve(true));

        const response = await request(server)
            .delete("/api/notification")
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            error: false,
            message: "Notifications deleted successfully",
        });
    });
});

// Test the delete notifications endpoint with failed requests
describe("Failed delete notifications endpoint tests", () => {
    test("A failed delete notifications attempt due to user not belonging to a household", async () => {
        findOneUser.mockImplementation(() =>
            Promise.resolve({
                _id: "63adcff10e718f3a3e7e65b9",
                email: "john_doe@email.com",
                password:
                    "$2a$10$uxdgbAZ0qu5oA1W574etDeGWukVsrOLCkZc0e/IFaronBO3gtBBza",
                householdID: null,
                name: "John Doe",
                date: "2022-12-30T14:00:28.108Z",
            })
        );
        findOneHousehold.mockImplementation(() => Promise.resolve(null));

        const response = await request(server)
            .delete("/api/notification")
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

    test("A failed delete notifications attempt due to user not having any notifications", async () => {
        findOneUser.mockImplementation(() =>
            Promise.resolve({
                _id: "63adcff10e718f3a3e7e65b9",
                email: "john_doe@email.com",
                password:
                    "$2a$10$uxdgbAZ0qu5oA1W574etDeGWukVsrOLCkZc0e/IFaronBO3gtBBza",
                householdID: "63adcff10e728f3a3e5e65b7",
                name: "John Doe",
                date: "2022-12-30T14:00:28.108Z",
                notifications: [],
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

        const response = await request(server)
            .delete("/api/notification")
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            error: true,
            message: "The specified user does not have any notifications",
        });
    });

    test("A failed delete notifications attempt due to an error occurring during the update operation", async () => {
        findOneUser.mockImplementation(() =>
            Promise.resolve({
                _id: "63adcff10e718f3a3e7e65b9",
                email: "john_doe@email.com",
                password:
                    "$2a$10$uxdgbAZ0qu5oA1W574etDeGWukVsrOLCkZc0e/IFaronBO3gtBBza",
                householdID: "63adcff10e728f3a3e5e65b7",
                name: "John Doe",
                date: "2022-12-30T14:00:28.108Z",
                notifications: [
                    "63adcff10e718f3a3e7e65b7",
                    "63b1ba6da2b164d686b35ae6",
                    "63b1ba96a2b164d686b35af5",
                ],
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
        findUserByIdAndUpdate.mockImplementation(() => {
            throw new Error("Something went wrong");
        });

        const response = await request(server)
            .delete("/api/notification")
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

// Test the mark as read endpoint with successful requests
describe("Successful mark as read endpoint tests", () => {
    test("A successful mark as read attempt", async () => {
        findOneUser.mockImplementation(() =>
            Promise.resolve({
                _id: "63adcff10e718f3a3e7e65b9",
                email: "john_doe@email.com",
                password:
                    "$2a$10$uxdgbAZ0qu5oA1W574etDeGWukVsrOLCkZc0e/IFaronBO3gtBBza",
                householdID: "63adcff10e728f3a3e5e65b7",
                name: "John Doe",
                date: "2022-12-30T14:00:28.108Z",
                notifications: [
                    "63adcff10e718f3a3e7e65b7",
                    "63b1ba6da2b164d686b35ae6",
                    "63b1ba96a2b164d686b35af5",
                ],
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
        findOneNotification.mockImplementation(() =>
            Promise.resolve({
                isRead: [],
            })
        );
        findNotificationByIdAndUpdate.mockImplementation(() =>
            Promise.resolve(true)
        );
        findNotification.mockImplementation(() =>
            Promise.resolve([
                { _id: "63adcff10e718f3a3e7e65b7" },
                { _id: "63b1ba6da2b164d686b35ae6" },
                { _id: "63b1ba96a2b164d686b35af5" },
            ])
        );

        const response = await request(server)
            .patch("/api/notification/read")
            .send({
                notificationId: "63adcff10e718f3a3e7e65b7",
            })
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            notifications: [
                { _id: "63adcff10e718f3a3e7e65b7" },
                { _id: "63b1ba6da2b164d686b35ae6" },
                { _id: "63b1ba96a2b164d686b35af5" },
            ],
        });
    });
});

// Test the mark as read endpoint with failed requests
describe("Failed mark as read endpoint tests", () => {
    test("A failed mark as read attempt due to user not belonging to a household", async () => {
        findOneUser.mockImplementation(() =>
            Promise.resolve({
                _id: "63adcff10e718f3a3e7e65b9",
                email: "john_doe@email.com",
                password:
                    "$2a$10$uxdgbAZ0qu5oA1W574etDeGWukVsrOLCkZc0e/IFaronBO3gtBBza",
                householdID: null,
                name: "John Doe",
                date: "2022-12-30T14:00:28.108Z",
                notifications: [
                    "63adcff10e718f3a3e7e65b7",
                    "63b1ba6da2b164d686b35ae6",
                    "63b1ba96a2b164d686b35af5",
                ],
            })
        );
        findOneHousehold.mockImplementation(() => Promise.resolve(null));

        const response = await request(server)
            .patch("/api/notification/read")
            .send({
                notificationId: "63adcff10e718f3a3e7e65b7",
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

    test("A failed mark as read attempt due to user not having any notifications", async () => {
        findOneUser.mockImplementation(() =>
            Promise.resolve({
                _id: "63adcff10e718f3a3e7e65b9",
                email: "john_doe@email.com",
                password:
                    "$2a$10$uxdgbAZ0qu5oA1W574etDeGWukVsrOLCkZc0e/IFaronBO3gtBBza",
                householdID: "63adcff10e728f3a3e5e65b7",
                name: "John Doe",
                date: "2022-12-30T14:00:28.108Z",
                notifications: [],
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

        const response = await request(server)
            .patch("/api/notification/read")
            .send({
                notificationId: "63adcff10e718f3a3e7e65b7",
            })
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            error: true,
            message: "The specified user does not have any notifications",
        });
    });

    test("A failed mark as read attempt due to a notification id not being provided", async () => {
        findOneUser.mockImplementation(() =>
            Promise.resolve({
                _id: "63adcff10e718f3a3e7e65b9",
                email: "john_doe@email.com",
                password:
                    "$2a$10$uxdgbAZ0qu5oA1W574etDeGWukVsrOLCkZc0e/IFaronBO3gtBBza",
                householdID: "63adcff10e728f3a3e5e65b7",
                name: "John Doe",
                date: "2022-12-30T14:00:28.108Z",
                notifications: [
                    "63adcff10e718f3a3e7e65b7",
                    "63b1ba6da2b164d686b35ae6",
                    "63b1ba96a2b164d686b35af5",
                ],
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

        const response = await request(server)
            .patch("/api/notification/read")
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            error: true,
            message: "A notification ID was not provided",
        });
    });

    test("A failed mark as read attempt due to an invalid notification id being provided", async () => {
        findOneUser.mockImplementation(() =>
            Promise.resolve({
                _id: "63adcff10e718f3a3e7e65b9",
                email: "john_doe@email.com",
                password:
                    "$2a$10$uxdgbAZ0qu5oA1W574etDeGWukVsrOLCkZc0e/IFaronBO3gtBBza",
                householdID: "63adcff10e728f3a3e5e65b7",
                name: "John Doe",
                date: "2022-12-30T14:00:28.108Z",
                notifications: [
                    "63adcff10e718f3a3e7e65b7",
                    "63b1ba6da2b164d686b35ae6",
                    "63b1ba96a2b164d686b35af5",
                ],
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

        const response = await request(server)
            .patch("/api/notification/read")
            .send({
                notificationId: "63adcff10e718f3a3e7e657",
            })
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            error: true,
            message: "The provided notification ID is invalid",
        });
    });

    test("A failed mark as read attempt due to a non-existent notification id being provided", async () => {
        findOneUser.mockImplementation(() =>
            Promise.resolve({
                _id: "63adcff10e718f3a3e7e65b9",
                email: "john_doe@email.com",
                password:
                    "$2a$10$uxdgbAZ0qu5oA1W574etDeGWukVsrOLCkZc0e/IFaronBO3gtBBza",
                householdID: "63adcff10e728f3a3e5e65b7",
                name: "John Doe",
                date: "2022-12-30T14:00:28.108Z",
                notifications: [
                    "63adcff10e718f3a3e7e65b7",
                    "63b1ba6da2b164d686b35ae6",
                    "63b1ba96a2b164d686b35af5",
                ],
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
        findOneNotification.mockImplementation(() => Promise.resolve(null));

        const response = await request(server)
            .patch("/api/notification/read")
            .send({
                notificationId: "63b1ba6da2b164d686b35aa1",
            })
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            error: true,
            message: "The specified notification does not exist",
        });
    });

    test("A failed mark as read attempt due to the notification already being marked as read", async () => {
        findOneUser.mockImplementation(() =>
            Promise.resolve({
                _id: "63adcff10e718f3a3e7e65b9",
                email: "john_doe@email.com",
                password:
                    "$2a$10$uxdgbAZ0qu5oA1W574etDeGWukVsrOLCkZc0e/IFaronBO3gtBBza",
                householdID: "63adcff10e728f3a3e5e65b7",
                name: "John Doe",
                date: "2022-12-30T14:00:28.108Z",
                notifications: [
                    "63adcff10e718f3a3e7e65b7",
                    "63b1ba6da2b164d686b35ae6",
                    "63b1ba96a2b164d686b35af5",
                ],
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
        findOneNotification.mockImplementation(() =>
            Promise.resolve({
                isRead: ["63adcff10e718f3a3e7e65b9"],
            })
        );

        const response = await request(server)
            .patch("/api/notification/read")
            .send({
                notificationId: "63b1ba6da2b164d686b35aa1",
            })
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            error: true,
            message: "The specified notification has already been read",
        });
    });

    test("A failed mark as read attempt due to the notification not belonging to the user", async () => {
        findOneUser.mockImplementation(() =>
            Promise.resolve({
                _id: "63adcff10e718f3a3e7e65b9",
                email: "john_doe@email.com",
                password:
                    "$2a$10$uxdgbAZ0qu5oA1W574etDeGWukVsrOLCkZc0e/IFaronBO3gtBBza",
                householdID: "63adcff10e728f3a3e5e65b7",
                name: "John Doe",
                date: "2022-12-30T14:00:28.108Z",
                notifications: [
                    "63adcff10e718f3a3e7e65b7",
                    "63b1ba6da2b164d686b35ae6",
                    "63b1ba96a2b164d686b35af5",
                ],
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
        findOneNotification.mockImplementation(() =>
            Promise.resolve({
                isRead: [],
            })
        );

        const response = await request(server)
            .patch("/api/notification/read")
            .send({
                notificationId: "63b1ba6da2b164d686b35aa1",
            })
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            error: true,
            message:
                "The specified notification does not belong to the specified user",
        });
    });
});

// Test the support notification endpoint with successful requests
describe("Successful support notification endpoint tests", () => {
    test("A successful support notification attempt", async () => {
        findOneUser.mockImplementation(() =>
            Promise.resolve({
                _id: "63adcff10e718f3a3e7e65b9",
                email: "john_doe@email.com",
                password:
                    "$2a$10$uxdgbAZ0qu5oA1W574etDeGWukVsrOLCkZc0e/IFaronBO3gtBBza",
                householdID: "63adcff10e728f3a3e5e65b7",
                name: "John Doe",
                date: "2022-12-30T14:00:28.108Z",
                notifications: [
                    "63adcff10e718f3a3e7e65b7",
                    "63b1ba6da2b164d686b35ae6",
                    "63b1ba96a2b164d686b35af5",
                ],
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
        findOneNotification.mockImplementation(() =>
            Promise.resolve({
                notificationType: "decline-chore-assignment",
                supportingUsers: [],
                numOfSupporters: 0,
                userID: "63b1ba6da2b164d686b35ae6",
            })
        );
        findNotificationByIdAndUpdate.mockImplementation(() =>
            Promise.resolve(true)
        );
        findNotification.mockImplementation(() =>
            Promise.resolve([
                { _id: "63adcff10e718f3a3e7e65b7" },
                { _id: "63b1ba6da2b164d686b35ae6" },
                { _id: "63b1ba96a2b164d686b35af5" },
            ])
        );

        const response = await request(server)
            .patch("/api/notification/support")
            .send({
                notificationId: "63adcff10e718f3a3e7e65b7",
            })
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            notifications: [
                { _id: "63adcff10e718f3a3e7e65b7" },
                { _id: "63b1ba6da2b164d686b35ae6" },
                { _id: "63b1ba96a2b164d686b35af5" },
            ],
        });
    });
});

// Test the support notification endpoint with failed requests
describe("Failed support notification endpoint tests", () => {
    test("A failed support notification attempt due to user not belonging to a household", async () => {
        findOneUser.mockImplementation(() =>
            Promise.resolve({
                _id: "63adcff10e718f3a3e7e65b9",
                email: "john_doe@email.com",
                password:
                    "$2a$10$uxdgbAZ0qu5oA1W574etDeGWukVsrOLCkZc0e/IFaronBO3gtBBza",
                householdID: null,
                name: "John Doe",
                date: "2022-12-30T14:00:28.108Z",
                notifications: [
                    "63adcff10e718f3a3e7e65b7",
                    "63b1ba6da2b164d686b35ae6",
                    "63b1ba96a2b164d686b35af5",
                ],
            })
        );
        findOneHousehold.mockImplementation(() => Promise.resolve(null));

        const response = await request(server)
            .patch("/api/notification/support")
            .send({
                notificationId: "63adcff10e718f3a3e7e65b7",
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

    test("A failed support notification attempt due to user not having any notifications", async () => {
        findOneUser.mockImplementation(() =>
            Promise.resolve({
                _id: "63adcff10e718f3a3e7e65b9",
                email: "john_doe@email.com",
                password:
                    "$2a$10$uxdgbAZ0qu5oA1W574etDeGWukVsrOLCkZc0e/IFaronBO3gtBBza",
                householdID: "63adcff10e728f3a3e5e65b7",
                name: "John Doe",
                date: "2022-12-30T14:00:28.108Z",
                notifications: [],
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

        const response = await request(server)
            .patch("/api/notification/support")
            .send({
                notificationId: "63adcff10e718f3a3e7e65b7",
            })
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            error: true,
            message: "The specified user does not have any notifications",
        });
    });

    test("A failed support notification attempt due to user not providing a notification id", async () => {
        findOneUser.mockImplementation(() =>
            Promise.resolve({
                _id: "63adcff10e718f3a3e7e65b9",
                email: "john_doe@email.com",
                password:
                    "$2a$10$uxdgbAZ0qu5oA1W574etDeGWukVsrOLCkZc0e/IFaronBO3gtBBza",
                householdID: "63adcff10e728f3a3e5e65b7",
                name: "John Doe",
                date: "2022-12-30T14:00:28.108Z",
                notifications: [
                    "63adcff10e718f3a3e7e65b7",
                    "63b1ba6da2b164d686b35ae6",
                    "63b1ba96a2b164d686b35af5",
                ],
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

        const response = await request(server)
            .patch("/api/notification/support")
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            error: true,
            message: "A notification ID was not provided",
        });
    });

    test("A failed support notification attempt due to user providing an invalid notification id", async () => {
        findOneUser.mockImplementation(() =>
            Promise.resolve({
                _id: "63adcff10e718f3a3e7e65b9",
                email: "john_doe@email.com",
                password:
                    "$2a$10$uxdgbAZ0qu5oA1W574etDeGWukVsrOLCkZc0e/IFaronBO3gtBBza",
                householdID: "63adcff10e728f3a3e5e65b7",
                name: "John Doe",
                date: "2022-12-30T14:00:28.108Z",
                notifications: [
                    "63adcff10e718f3a3e7e65b7",
                    "63b1ba6da2b164d686b35ae6",
                    "63b1ba96a2b164d686b35af5",
                ],
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

        const response = await request(server)
            .patch("/api/notification/support")
            .send({
                notificationId: "63adcff10e718f3a3e7e6zzz",
            })
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            error: true,
            message: "The provided notification ID is invalid",
        });
    });

    test("A failed support notification attempt due to a non-existent notification id being provided", async () => {
        findOneUser.mockImplementation(() =>
            Promise.resolve({
                _id: "63adcff10e718f3a3e7e65b9",
                email: "john_doe@email.com",
                password:
                    "$2a$10$uxdgbAZ0qu5oA1W574etDeGWukVsrOLCkZc0e/IFaronBO3gtBBza",
                householdID: "63adcff10e728f3a3e5e65b7",
                name: "John Doe",
                date: "2022-12-30T14:00:28.108Z",
                notifications: [
                    "63adcff10e718f3a3e7e65b7",
                    "63b1ba6da2b164d686b35ae6",
                    "63b1ba96a2b164d686b35af5",
                ],
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
        findOneNotification.mockImplementation(() => Promise.resolve(null));

        const response = await request(server)
            .patch("/api/notification/support")
            .send({
                notificationId: "63adcff10e718f3a3e7e65b7",
            })
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            error: true,
            message: "The specified notification does not exist",
        });
    });

    test("A failed support notification attempt due to the specified notification not belonging to the specified user", async () => {
        findOneUser.mockImplementation(() =>
            Promise.resolve({
                _id: "63adcff10e718f3a3e7e65b9",
                email: "john_doe@email.com",
                password:
                    "$2a$10$uxdgbAZ0qu5oA1W574etDeGWukVsrOLCkZc0e/IFaronBO3gtBBza",
                householdID: "63adcff10e728f3a3e5e65b7",
                name: "John Doe",
                date: "2022-12-30T14:00:28.108Z",
                notifications: [
                    "63b1ba6da2b164d686b35ae6",
                    "63b1ba96a2b164d686b35af5",
                ],
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
        findOneNotification.mockImplementation(() =>
            Promise.resolve({
                notificationType: "decline-chore-assignment",
                supportingUsers: [],
                numOfSupporters: 0,
                userID: "63b1ba6da2b164d686b35ae6",
            })
        );

        const response = await request(server)
            .patch("/api/notification/support")
            .send({
                notificationId: "63adcff10e718f3a3e7e65b7",
            })
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            error: true,
            message:
                "The specified notification does not belong to the specified user",
        });
    });

    test("A failed support notification attempt due to the specified notification being an incorrect notification type", async () => {
        findOneUser.mockImplementation(() =>
            Promise.resolve({
                _id: "63adcff10e718f3a3e7e65b9",
                email: "john_doe@email.com",
                password:
                    "$2a$10$uxdgbAZ0qu5oA1W574etDeGWukVsrOLCkZc0e/IFaronBO3gtBBza",
                householdID: "63adcff10e728f3a3e5e65b7",
                name: "John Doe",
                date: "2022-12-30T14:00:28.108Z",
                notifications: [
                    "63adcff10e718f3a3e7e65b7",
                    "63b1ba6da2b164d686b35ae6",
                    "63b1ba96a2b164d686b35af5",
                ],
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
        findOneNotification.mockImplementation(() =>
            Promise.resolve({
                notificationType: "standard",
                supportingUsers: [],
                numOfSupporters: 0,
                userID: "63b1ba6da2b164d686b35ae6",
            })
        );

        const response = await request(server)
            .patch("/api/notification/support")
            .send({
                notificationId: "63adcff10e718f3a3e7e65b7",
            })
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            error: true,
            message: "Cannot show support for this type of notificaiton",
        });
    });

    test("A failed support notification attempt due to the specified notification already being supported by the specified user", async () => {
        findOneUser.mockImplementation(() =>
            Promise.resolve({
                _id: "63adcff10e718f3a3e7e65b9",
                email: "john_doe@email.com",
                password:
                    "$2a$10$uxdgbAZ0qu5oA1W574etDeGWukVsrOLCkZc0e/IFaronBO3gtBBza",
                householdID: "63adcff10e728f3a3e5e65b7",
                name: "John Doe",
                date: "2022-12-30T14:00:28.108Z",
                notifications: [
                    "63adcff10e718f3a3e7e65b7",
                    "63b1ba6da2b164d686b35ae6",
                    "63b1ba96a2b164d686b35af5",
                ],
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
        findOneNotification.mockImplementation(() =>
            Promise.resolve({
                notificationType: "decline-chore-assignment",
                supportingUsers: ["63adcff10e718f3a3e7e65b9"],
                numOfSupporters: 0,
                userID: "63b1ba6da2b164d686b35ae6",
            })
        );

        const response = await request(server)
            .patch("/api/notification/support")
            .send({
                notificationId: "63adcff10e718f3a3e7e65b7",
            })
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            error: true,
            message:
                "Cannot show support more than once for the same notification",
        });
    });

    test("A failed support notification attempt due to the specified notification belonging to the specified user", async () => {
        findOneUser.mockImplementation(() =>
            Promise.resolve({
                _id: "63adcff10e718f3a3e7e65b9",
                email: "john_doe@email.com",
                password:
                    "$2a$10$uxdgbAZ0qu5oA1W574etDeGWukVsrOLCkZc0e/IFaronBO3gtBBza",
                householdID: "63adcff10e728f3a3e5e65b7",
                name: "John Doe",
                date: "2022-12-30T14:00:28.108Z",
                notifications: [
                    "63adcff10e718f3a3e7e65b7",
                    "63b1ba6da2b164d686b35ae6",
                    "63b1ba96a2b164d686b35af5",
                ],
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
        findOneNotification.mockImplementation(() =>
            Promise.resolve({
                notificationType: "decline-chore-assignment",
                supportingUsers: [],
                numOfSupporters: 0,
                userID: "63adcff10e718f3a3e7e65b9",
            })
        );

        const response = await request(server)
            .patch("/api/notification/support")
            .send({
                notificationId: "63adcff10e718f3a3e7e65b7",
            })
            .set(
                "auth-token",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2FlZWVmYzU3N2E3YTE3NmYyN2UwZWQiLCJpYXQiOjE2NzI0MDg4Mjh9.0hd8GuY2soUuMBUodAOYFm_ezLv7iveavkn3PPK5_i0"
            );

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            error: true,
            message: "Cannot show support for your own chore decline",
        });
    });
});
