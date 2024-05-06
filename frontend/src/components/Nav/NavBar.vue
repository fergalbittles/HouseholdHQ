<template>
  <v-app-bar v-model="showAppBar" class="!bg-gradient-to-r !from-teal-800 !to-teal-900">
    <template v-slot:prepend>
      <v-app-bar-nav-icon
        class="text-white"
        @click="sidebar = !sidebar"
      ></v-app-bar-nav-icon>
    </template>

    <v-app-bar-title class="text-white font-medium"
      >HouseholdHQ</v-app-bar-title
    ></v-app-bar
  >

  <v-navigation-drawer
    id="box-shadow"
    v-model="showNavDrawer"
    :temporary="showAppBar"
    :permanent="!showAppBar"
    class="!bg-gradient-to-r !from-teal-800 !to-teal-900"
    theme="dark"
  >
    <v-list>
      <v-list-item
        class="w-[95%] mx-auto rounded-lg py-2"
        @click="
          sidebar = !sidebar;
          router.push({ name: 'profile' });
        "
        :active="route.name == 'profile'"
        :prepend-avatar="
          user?.profilePhoto > -1
            ? 'https://xsgames.co/randomusers/assets/avatars/pixel/' +
              user?.profilePhoto +
              '.jpg'
            : require('../../assets/avatar.jpeg')
        "
        :title="user?.name"
        :subtitle="household?.name"
      ></v-list-item>
    </v-list>
    <v-divider />
    <v-list density="compact" nav>
      <v-list-item
        prepend-icon="mdi-home"
        title="Household Info"
        value="home"
        :active="route.name == 'home'"
        @click="
          sidebar = !sidebar;
          router.push({ name: 'home' });
        "
      ></v-list-item>
      <v-list-item
        prepend-icon="mdi-bell"
        title="Notifications"
        value="Notifications"
        :active="route.name == 'notifications'"
        @click="
          sidebar = !sidebar;
          router.push({ name: 'notifications' });
        "
      >
        <template v-if="unreadCount > 0" v-slot:append>
          <v-badge color="info" :content="unreadCount" inline></v-badge>
        </template>
      </v-list-item>
      <v-list-item
        prepend-icon="mdi-format-list-checks"
        title="Chores"
        value="chores"
        :active="route.name == 'chores'"
        @click="
          sidebar = !sidebar;
          router.push({ name: 'chores' });
        "
      ></v-list-item>
      <v-list-item
        prepend-icon="mdi-cart-outline"
        title="Shopping List"
        value="Shopping List"
        :active="route.name == 'shopping'"
        @click="
          sidebar = !sidebar;
          router.push({ name: 'shopping' });
        "
      ></v-list-item>
      <v-list-item
        prepend-icon="mdi-cash-multiple"
        title="Bills"
        value="Bills"
        :active="route.name == 'bills'"
        @click="
          sidebar = !sidebar;
          router.push({ name: 'bills' });
        "
      ></v-list-item>
      <v-list-item
        prepend-icon="mdi-calendar-clock"
        title="Activities"
        value="Activities"
        :active="route.name == 'activities'"
        @click="
          sidebar = !sidebar;
          router.push({ name: 'activities' });
        "
      ></v-list-item>
      <v-list-item
        prepend-icon="mdi-check-decagram"
        title="Requests"
        value="Requests"
        :active="route.name == 'requests'"
        @click="
          sidebar = !sidebar;
          router.push({ name: 'requests' });
        "
      ></v-list-item>
      <v-list-item
        prepend-icon="mdi-forum"
        title="Discussions"
        value="Discussions"
        @click="
          sidebar = !sidebar;
          router.push({ name: 'discussions' });
        "
      ></v-list-item>
    </v-list>

    <template v-slot:append>
      <div class="pa-5">
        <v-btn @click="logout" class="!h-[45px] bg-emerald-600" block>Logout</v-btn>
      </div>
    </template>
  </v-navigation-drawer>
</template>

<script setup>
import { onBeforeMount, ref, computed, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { user, fetchUserInfo } from "../../util/userInfo";
import { household, fetchHouseholdInfo } from "../../util/useHousehold";
import {
  chores,
  currentChore,
  fetchChores,
  fetchChore,
  randomChore,
  selfAssignConfirmation,
  selfRequestConfirmation,
  acceptRequestConfirmation,
  declineRequestConfirmation,
} from "../../util/useChores";
import {
  notifications,
  unreadCount,
  fetchNotifications,
} from "../../util/useNotifications";
import { useDisplay } from "vuetify";
import { API_URL } from "../../config";
import io from "socket.io-client";

const socket = ref(null);
const isLive = ref(false);
const route = useRoute();
const router = useRouter();
const sidebar = ref(false);
const { name } = useDisplay();

// Set the socket
watch(
  household,
  (currentValue) => {
    if (isLive.value) {
      return;
    }

    if (currentValue != null) {
      isLive.value = true;

      socket.value = io(API_URL, {
        extraHeaders: {
          "household-id": household?.value?._id.toString(),
        },
      });

      socket.value.on("user-joined-household", () => {
        fetchHouseholdInfo();
        fetchNotifications();
      });

      socket.value.on("user-left-household", () => {
        fetchHouseholdInfo();
        fetchNotifications();
      });

      socket.value.on("chore-created", () => {
        fetchChores();
      });

      socket.value.on("chore-updated", (data) => {
        if (route.name === "chores") {
          fetchChores();
        }

        if (route.name === "chore") {
          if (data.choreId != currentChore?.value?._id) {
            return;
          }

          fetchChore(data.choreId);
        }
      });

      socket.value.on("chore-assigned-self", (data) => {
        fetchNotifications();
        fetchChores();

        if (route.name === "chore") {
          if (data.choreId != currentChore?.value?._id) {
            return;
          }

          fetchChore(data.choreId);
        }
      });

      socket.value.on("chore-assigned-request", (data) => {
        fetchNotifications();

        if (route.name === "chore") {
          if (data.choreId != currentChore?.value?._id) {
            return;
          }

          fetchChore(data.choreId);
        }
      });

      socket.value.on("chore-assigned-response", (data) => {
        fetchNotifications();
        fetchChores();

        if (route.name === "chore") {
          if (data.choreId != currentChore?.value?._id) {
            return;
          }

          fetchChore(data.choreId);
        }
      });

      socket.value.on("chore-assigned-random", (data) => {
        fetchNotifications();
        fetchHouseholdInfo();
        fetchChores();

        if (route.name === "chore") {
          if (data.choreId != currentChore?.value?._id) {
            return;
          }

          fetchChore(data.choreId);
        }
      });

      socket.value.on("chore-assignment-declined", (data) => {
        fetchNotifications();
        fetchChores();

        if (data.choreId !== currentChore?.value?._id) {
          return;
        }

        fetchChore(data.choreId);
      });

      socket.value.on("chore-completed", (data) => {
        fetchNotifications();
        fetchHouseholdInfo();
        fetchChores();

        if (route.name === "chore") {
          if (data.choreId != currentChore?.value?._id) {
            return;
          }

          fetchChore(data.choreId);
        }
      });

      socket.value.on("notification-supported", () => {
        fetchNotifications();
      });

      socket.value.on("chore-deleted", (data) => {
        fetchChores();

        if (route.name === "chore") {
          if (data.choreId != currentChore?.value?._id) {
            return;
          }

          router.push({ name: "chores" });
        }
      });

      socket.value.on("chores-list-updated", () => {
        if (route.name === "chores" || route.name === "chore") {
          fetchChores();
        }
      });

      socket.value.on("profile-photo-updated", () => {
        fetchUserInfo();
        fetchHouseholdInfo();
      });
    }
  },
  { deep: true, immediate: true }
);

// Set the unread count
watch(
  notifications,
  (currentValue) => {
    unreadCount.value = currentValue.filter(
      (notification) => !notification?.isRead?.includes(user.value?.id)
    ).length;
  },
  { deep: true, immediate: true }
);
watch(
  user,
  (currentValue) => {
    if (currentValue !== null) {
      unreadCount.value = notifications.value?.filter(
        (notification) => !notification?.isRead?.includes(user.value.id)
      ).length;
    }
  },
  { deep: true, immediate: true }
);

function logout() {
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
}

const showAppBar = computed(() => {
  return name.value === "xs" || name.value === "sm";
});

const showNavDrawer = computed(() => {
  return (name.value !== "xs" && name.value !== "sm") || sidebar.value;
});

onBeforeMount(() => {
  if (!household.value) {
    fetchHouseholdInfo();
  }

  if (!user.value) {
    fetchUserInfo();
  }

  if (notifications.value.length < 1) {
    fetchNotifications();
  }
});
</script>

<style>
#box-shadow {
  box-shadow: rgb(38, 57, 77) 0px 20px 30px -10px;
}
</style>
