import { ref } from "vue";
import axios from "axios";
import { API_URL } from "../config";

export const notifications = ref([]);
export const unreadCount = ref(0);
export const loading = ref(false);

export async function fetchNotifications() {
    const authToken = localStorage.getItem("SavedToken");

    if (!authToken) {
        return;
    }

    loading.value = true;

    axios
        .get(API_URL + "/api/notification", {
            headers: {
                "auth-token": authToken,
            },
        })
        .then((res) => {
            notifications.value = res.data.notifications;
        })
        .catch((err) => {
            console.log(err);
        })
        .finally(() => {
            loading.value = false;
        });
}

export async function readNotification(notificationId) {
    const authToken = localStorage.getItem("SavedToken");

    if (!authToken) {
        return;
    }

    loading.value = true;

    axios
        .patch(
            API_URL + "/api/notification/read",
            { notificationId: notificationId },
            {
                headers: {
                    "auth-token": authToken,
                },
            }
        )
        .then((res) => {
            notifications.value = res.data.notifications;
        })
        .catch((err) => {
            console.log(err);
        })
        .finally(() => {
            loading.value = false;
        });
}

export async function supportNotification(notificationId) {
    const authToken = localStorage.getItem("SavedToken");

    if (!authToken) {
        return;
    }

    loading.value = true;

    axios
        .patch(
            API_URL + "/api/notification/support",
            { notificationId: notificationId },
            {
                headers: {
                    "auth-token": authToken,
                },
            }
        )
        .then((res) => {
            notifications.value = res.data.notifications;
        })
        .catch((err) => {
            console.log(err);
        })
        .finally(() => {
            loading.value = false;
        });
}

export async function deleteNotifications() {
    const authToken = localStorage.getItem("SavedToken");

    if (!authToken) {
        return;
    }

    loading.value = true;

    axios
        .delete(API_URL + "/api/notification", {
            headers: {
                "auth-token": authToken,
            },
        })
        .then(() => {
            notifications.value = [];
        })
        .catch((err) => {
            console.log(err);
        })
        .finally(() => {
            loading.value = false;
        });
}
