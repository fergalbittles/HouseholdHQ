import { ref } from "vue";
import axios from "axios";
import { API_URL } from "../config";

export const user = ref(null);
export const loading = ref(false);

export async function fetchUserInfo() {
    const authToken = localStorage.getItem("SavedToken");

    if (!authToken) {
        return;
    }

    axios
        .get(API_URL + "/api/user", {
            headers: {
                "auth-token": authToken,
            },
        })
        .then((res) => {
            user.value = res.data.user;
        })
        .catch((err) => {
            console.log(err);
        });
}

export async function updateProfilePhoto(profilePhoto) {
    const authToken = localStorage.getItem("SavedToken");

    if (!authToken) {
        return;
    }

    loading.value = true;

    axios
        .patch(
            API_URL + "/api/household/profile/photo",
            {
                profilePhoto: profilePhoto,
            },
            {
                headers: {
                    "auth-token": authToken,
                },
            }
        )
        .catch((err) => {
            console.log(err);
        })
        .finally(() => {
            loading.value = false;
        });
}
