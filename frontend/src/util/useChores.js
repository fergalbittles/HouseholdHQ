import axios from "axios";
import { API_URL } from "../config";
import { ref } from "vue";

export const loading = ref(false);
export const chores = ref([]);
export const currentChore = ref(null);
export const randomChore = ref(null);

// Only show the following confirmation modals once
export const selfAssignConfirmation = ref(false);
export const selfRequestConfirmation = ref(false);
export const acceptRequestConfirmation = ref(false);
export const declineRequestConfirmation = ref(false);

export async function fetchChores() {
    const authToken = localStorage.getItem("SavedToken");

    if (!authToken) {
        return;
    }

    loading.value = true;

    axios
        .get(API_URL + "/api/chore/all", {
            headers: {
                "auth-token": authToken,
            },
        })
        .then((res) => {
            chores.value = res.data.chores;
        })
        .catch((err) => {
            chores.value = [];
            console.log(err);
        })
        .finally(() => {
            loading.value = false;
        });
}

export async function fetchChore(choreId) {
    const authToken = localStorage.getItem("SavedToken");

    if (!authToken) {
        return;
    }

    loading.value = true;

    axios
        .get(API_URL + "/api/chore", {
            params: {
                choreId: choreId,
            },
            headers: {
                "auth-token": authToken,
            },
        })
        .then((res) => {
            currentChore.value = res.data.chore;
        })
        .catch((err) => {
            if (err?.response?.status < 500) {
                currentChore.value = null;
            }
        })
        .finally(() => {
            loading.value = false;
        });
}

export async function createChore(choreInput) {
    const authToken = localStorage.getItem("SavedToken");

    if (!authToken) {
        return;
    }

    loading.value = true;

    axios
        .post(
            API_URL + "/api/chore",
            {
                title: choreInput,
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

    event.target.value = "";
}

export async function deleteChore(choreId) {
    const authToken = localStorage.getItem("SavedToken");

    if (!authToken) {
        return;
    }

    loading.value = true;

    axios
        .delete(API_URL + "/api/chore", {
            params: {
                choreId: choreId,
            },
            headers: {
                "auth-token": authToken,
            },
        })
        .then(() => {
            currentChore.value = null;
        })
        .catch(() => {
            currentChore.value = null;
        })
        .finally(() => {
            loading.value = false;
        });
}

export async function completeChore(choreId) {
    const authToken = localStorage.getItem("SavedToken");

    if (!authToken) {
        return;
    }

    loading.value = true;

    axios
        .patch(
            API_URL + "/api/chore/complete",
            { choreId: choreId },
            {
                headers: {
                    "auth-token": authToken,
                },
            }
        )
        .then((res) => {
            currentChore.value = res.data.chore;
        })
        .catch((err) => {
            if (err?.response?.status < 500) {
                currentChore.value = null;
            }
        })
        .finally(() => {
            loading.value = false;
        });
}

export async function updateChore(
    choreId,
    choreTitle,
    choreDescription,
    chorePriority,
    choreDueDate
) {
    const authToken = localStorage.getItem("SavedToken");

    if (!authToken) {
        return;
    }

    loading.value = true;

    axios
        .patch(
            API_URL + "/api/chore",
            {
                choreId: choreId,
                title: choreTitle,
                description: choreDescription,
                priority: chorePriority,
                dateDue: choreDueDate,
            },
            {
                headers: {
                    "auth-token": authToken,
                },
            }
        )
        .then((res) => {
            currentChore.value = res.data.chore;
        })
        .catch((err) => {
            if (err?.response?.status < 500) {
                currentChore.value = null;
            }
        })
        .finally(() => {
            loading.value = false;
        });
}

export async function assignChoreToSelf(choreId, isHomepage) {
    const authToken = localStorage.getItem("SavedToken");

    if (!authToken) {
        return;
    }

    loading.value = true;

    axios
        .patch(
            API_URL + "/api/chore/assign/self",
            {
                choreId: choreId,
            },
            {
                headers: {
                    "auth-token": authToken,
                },
            }
        )
        .then((res) => {
            if (isHomepage) {
                randomChore.value = res.data.chore;
            } else {
                currentChore.value = res.data.chore;
            }
        })
        .catch((err) => {
            if (err?.response?.status < 500) {
                currentChore.value = null;
            }
        })
        .finally(() => {
            loading.value = false;
        });
}

export async function assignChoreRandomly(choreId, isHomepage) {
    const authToken = localStorage.getItem("SavedToken");

    if (!authToken) {
        return;
    }

    loading.value = true;

    axios
        .patch(
            API_URL + "/api/chore/assign/random",
            {
                choreId: choreId,
            },
            {
                headers: {
                    "auth-token": authToken,
                },
            }
        )
        .then((res) => {
            if (isHomepage) {
                randomChore.value = res.data.chore;
            } else {
                currentChore.value = res.data.chore;
            }
        })
        .catch((err) => {
            if (err?.response?.status < 500) {
                currentChore.value = null;
            }
        })
        .finally(() => {
            loading.value = false;
        });
}

export async function declineChoreAssignment(choreId, reason) {
    const authToken = localStorage.getItem("SavedToken");

    if (!authToken) {
        return;
    }

    loading.value = true;

    axios
        .patch(
            API_URL + "/api/chore/assign/random/decline",
            {
                choreId: choreId,
                reason: reason,
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

export async function assignChoreRequest(choreId) {
    const authToken = localStorage.getItem("SavedToken");

    if (!authToken) {
        return;
    }

    loading.value = true;

    axios
        .patch(
            API_URL + "/api/chore/assign/request",
            {
                choreId: choreId,
            },
            {
                headers: {
                    "auth-token": authToken,
                },
            }
        )
        .then((res) => {
            currentChore.value = res.data.chore;
        })
        .catch((err) => {
            if (err?.response?.status < 500) {
                currentChore.value = null;
            }
        })
        .finally(() => {
            loading.value = false;
        });
}

export async function respondToAssigneeRequest(
    choreId,
    assigneeRequestResponse
) {
    const authToken = localStorage.getItem("SavedToken");

    if (!authToken) {
        return;
    }

    loading.value = true;

    axios
        .patch(
            API_URL + "/api/chore/assign/request/respond",
            {
                choreId: choreId,
                assigneeRequestResponse: assigneeRequestResponse,
            },
            {
                headers: {
                    "auth-token": authToken,
                },
            }
        )
        .then((res) => {
            currentChore.value = res.data.chore;
        })
        .catch((err) => {
            if (err?.response?.status < 500) {
                currentChore.value = null;
            }
        })
        .finally(() => {
            loading.value = false;
        });
}

export async function updateChoreList(updatedChoreList) {
    const authToken = localStorage.getItem("SavedToken");

    if (!authToken) {
        return;
    }

    loading.value = true;

    axios
        .patch(
            API_URL + "/api/household/chores",
            {
                chores: updatedChoreList,
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
