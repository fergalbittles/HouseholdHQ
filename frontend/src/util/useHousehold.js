import { ref } from "vue";
import axios from "axios";
import { API_URL } from "../config";

export const loading = ref(false);
export const household = ref(null);
export const inviteResponse = ref(null);

export async function fetchHouseholdInfo() {
    const authToken = localStorage.getItem("SavedToken");

    if (!authToken) {
        return;
    }

    loading.value = true;

    axios
        .get(API_URL + "/api/household", {
            headers: {
                "auth-token": authToken,
            },
        })
        .then((res) => {
            household.value = res.data.household;
        })
        .catch((err) => {
            console.log(err);
        })
        .finally(() => {
            loading.value = false;
        });
}

export async function inviteMember(email) {
    const authToken = localStorage.getItem("SavedToken");

    if (!authToken) {
        return;
    }

    loading.value = true;

    axios
        .post(
            API_URL + "/api/household/invite",
            { email: email },
            {
                headers: {
                    "auth-token": authToken,
                },
            }
        )
        .then((res) => {
            inviteResponse.value = res.data;
        })
        .catch((err) => {
            console.log(err);
            inviteResponse.value = err?.response?.data;
        })
        .finally(() => {
            loading.value = false;
        });
}

export async function leaveHousehold() {
    const authToken = localStorage.getItem("SavedToken");

    if (!authToken) {
        return;
    }

    loading.value = true;

    axios
        .patch(
            API_URL + "/api/household/leave",
            {},
            {
                headers: {
                    "auth-token": authToken,
                },
            }
        )
        .then((res) => {
            household.value = res.data.household;
        })
        .catch((err) => {
            console.log(err);
        })
        .finally(() => {
            loading.value = false;
        });
}
