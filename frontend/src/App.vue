<template>
  <v-app class="bg-gradient-to-r from-cyan-200 to-blue-500">
    <NavBar v-if="showNav" />
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup>
import NavBar from "./components/Nav/NavBar.vue";
import axios from "axios";
import { API_URL } from "./config";
import { onBeforeMount, watch, ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { user } from "./util/userInfo";

const router = useRouter();
const route = useRoute();
const showNav = ref(false);

watch(
  route,
  (currentValue) => {
    const path = currentValue.fullPath;

    if (!path) {
      return;
    }

    if (path.includes("/welcome")) {
      showNav.value = false;
    } else {
      showNav.value = true;
    }
  },
  { deep: true, immediate: true }
);

onBeforeMount(() => {
  const authToken = localStorage.getItem("SavedToken");

  if (!authToken) {
    router.push({ path: "/welcome/account" });
    return;
  }

  axios
    .get(API_URL + "/api/user", {
      headers: {
        "auth-token": authToken,
      },
    })
    .then((res) => {
      const householdId = res.data.user.householdId;

      if (!householdId) {
        router.push({ path: "/welcome/household" });
      }

      user.value = res.data.user;
    })
    .catch(() => {
      // Delete token and push to welcome page
      localStorage.removeItem("SavedToken");
      router.push({ path: "/welcome/account" });
    });
});
</script>
