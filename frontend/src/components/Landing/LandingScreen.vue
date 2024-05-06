<template>
  <h1
    id="login_heading"
    class="max-w-[500px] w-[90%] text-white text-h5 mt-7 shadow-xl block mx-auto py-4 text-center font-medium rounded-lg bg-gradient-to-r from-emerald-500 to-teal-800 border-solid border-2"
  >
    HouseholdHQ
  </h1>

  <router-view />
</template>

<script setup>
import { useRouter } from "vue-router";
import { user } from "../../util/userInfo";
import { household } from "../../util/useHousehold";
import {
  chores,
  currentChore,
  randomChore,
  selfAssignConfirmation,
  selfRequestConfirmation,
  acceptRequestConfirmation,
  declineRequestConfirmation,
} from "../../util/useChores";
import { notifications } from "../../util/useNotifications";

const router = useRouter();

// Reset the global state
localStorage.removeItem("SavedToken");
user.value = null;
household.value = null;
chores.value = [];
currentChore.value = null;
notifications.value = [];
randomChore.value = null;
selfAssignConfirmation.value = false;
selfRequestConfirmation.value = false;
acceptRequestConfirmation.value = false;
declineRequestConfirmation.value = false;

router.push({ path: "/welcome/account" });
</script>

<style>
#login_heading {
  text-shadow: 0 0 10px rgba(0, 0, 0, 0.26);
}
</style>
