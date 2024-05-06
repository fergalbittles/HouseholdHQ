<template>
  <div>
    <h1
      id="page_heading"
      class="w-[90%] text-white text-h4 mt-7 block mx-auto font-medium"
    >
      Notifications
    </h1>

    <p v-if="unreadCount > 0" class="w-[90%] mx-auto text-white font-light">
      Select an unread notificaiton to mark it as read
    </p>

    <p id="page_paragraph" class="w-[90%] text-white mx-auto mt-6 text-xl font-semibold">
      {{ unreadCount }}
      unread notification<span v-if="unreadCount !== 1">s</span>
    </p>

    <v-card
      id="chore_box"
      class="w-[90%] mx-auto mt-2 pb-5 pt-3 rounded-lg !bg-gradient-to-r !from-emerald-500 !to-teal-800"
    >
      <div v-if="notifications.length < 1">
        <p class="my-3 text-white text-lg text-center italic">
          There aren't any notifications
        </p>
      </div>
      <div v-for="(notification, index) in notifications.slice().reverse()" :key="index">
        <p
          v-if="notificationDates[index]?.date"
          class="mx-auto w-[96.5%] mb-2 text-white font-semibold"
        >
          {{ formatDate(notification.date) }}
        </p>
        <div
          @click="
            if (
              notification.notificationType !== 'decline-chore-assignment' &&
              notification.notificationType !== 'chore-request' &&
              (notification.notificationType !== 'random-chore-assignment' ||
                chores?.filter((chore) => chore?._id === notification?.choreID).length <
                  1 ||
                chores?.filter((chore) => chore?._id === notification?.choreID)[0]
                  .isCompleted ||
                chores?.filter((chore) => chore?._id === notification?.choreID)[0]
                  .assignee !== user?.id)
            ) {
              markAsRead(notification._id, notification.isRead.includes(user?.id));
            }
          "
          :class="{
            'completed-chore': notification.isRead.includes(user?.id),
            'cursor-pointer':
              !notification.isRead.includes(user?.id) &&
              notification.notificationType !== 'decline-chore-assignment' &&
              notification.notificationType !== 'chore-request' &&
              (notification.notificationType !== 'random-chore-assignment' ||
                chores?.filter((chore) => chore?._id === notification?.choreID).length <
                  1 ||
                chores?.filter((chore) => chore?._id === notification?.choreID)[0]
                  .isCompleted ||
                chores?.filter((chore) => chore?._id === notification?.choreID)[0]
                  .assignee !== user?.id),
            'cursor-not-allowed': notification.isRead.includes(user?.id),
            'h-[72px]':
              notification.notificationType !== 'random-chore-assignment' &&
              notification.notificationType !== 'chore-request' &&
              notification.notificationType !== 'decline-chore-assignment',
          }"
          class="w-[96.5%] !rounded-lg mx-auto mb-4 pa-3 pr-0 m-auto flex shadow-xl bg-white"
        >
          <v-list-item
            :append-icon="
              notification.isRead.includes(user?.id)
                ? 'mdi-email-open-outline'
                : 'mdi-email-outline'
            "
            class="w-[95%]"
            :title="
              notification.userID && user?.id && notification.userID === user?.id
                ? 'You declined a chore' + formatTime(notification.date)
                : notification.title + formatTime(notification.date)
            "
            :value="notification.title"
            :subtitle="notification.description"
          >
            <div v-if="notification.notificationType === 'decline-chore-assignment'">
              <p class="mt-1 font-medium">
                Reason: {{ notification.declineChoreReason }}
              </p>
              <p
                v-if="notification.numOfSupporters > 0"
                class="italic mt-1 text-sm font-medium text-green-700"
              >
                {{ notification.numOfSupporters }} member<span
                  v-if="notification.numOfSupporters > 1"
                  >s</span
                >
                support<span v-if="notification.numOfSupporters === 1">s</span> this
                decision
              </p>
              <div v-if="!notification.isRead.includes(user?.id)">
                <v-btn
                  :disabled="loading"
                  @click="
                    markAsRead(notification._id, notification.isRead.includes(user?.id))
                  "
                  variant="flat"
                  class="mr-2 mt-2"
                  color="success"
                  size="small"
                  >Mark as Read</v-btn
                >
                <v-btn
                  @click="
                    supportNotification(notification._id);
                    readNotification(notification._id);
                  "
                  v-if="
                    notification.userID &&
                    user?.id &&
                    notification.userID !== user?.id &&
                    !notification.supportingUsers.includes(user?.id)
                  "
                  prepend-icon="mdi-thumb-up"
                  :disabled="loading"
                  variant="flat"
                  class="mt-2"
                  color="info"
                  size="small"
                  >Show Support</v-btn
                >
              </div>
            </div>

            <div
              v-if="
                notification.notificationType === 'chore-request' &&
                !notification.isRead.includes(user?.id)
              "
              class="mt-2"
            >
              <v-btn
                :disabled="loading"
                @click="
                  markAsRead(notification._id, notification.isRead.includes(user?.id))
                "
                variant="flat"
                color="success"
                size="small"
                >Mark as Read</v-btn
              >
              <v-btn
                v-if="
                  chores?.filter((chore) => chore?._id === notification?.choreID).length >
                  0
                "
                :disabled="loading"
                class="ml-2"
                variant="flat"
                color="info"
                size="small"
                @click="$router.push('/chores/' + notification.choreID)"
                >Go To Chore</v-btn
              >
            </div>

            <div
              v-if="
                notification.notificationType === 'random-chore-assignment' &&
                !notification.isRead.includes(user?.id)
              "
              class="mt-2"
            >
              <div
                v-if="
                  chores?.filter((chore) => chore?._id === notification?.choreID).length >
                    0 &&
                  chores?.filter((chore) => chore?._id === notification?.choreID)[0]
                    .isCompleted === false &&
                  chores?.filter((chore) => chore?._id === notification?.choreID)[0]
                    .assignee === user?.id
                "
              >
                <input
                  class="pl-2 rounded border-[1px] border-[#bbb] border-solid bg-[#eee]"
                  :class="{
                    'border-red-400': showErrorMessage,
                    'mb-2': !showErrorMessage,
                    'mb-1': showErrorMessage,
                  }"
                  type="text"
                  name="reason"
                  placeholder="Reason..."
                  v-model="reason"
                />
                <br />
                <p v-if="showErrorMessage" class="text-red italic mb-1 text-sm">
                  You must provide a reason to decline a chore
                </p>
                <v-btn
                  :disabled="loading"
                  @click="
                    markAsRead(notification._id, notification.isRead.includes(user?.id))
                  "
                  variant="flat"
                  color="success"
                  size="small"
                >
                  Mark as Read
                </v-btn>
                <v-btn
                  :disabled="loading"
                  @click="
                    declineChore(
                      notification.choreID,
                      notification._id,
                      notification.isRead.includes(user?.id)
                    )
                  "
                  class="ml-2"
                  variant="flat"
                  color="error"
                  size="small"
                >
                  Decline Chore
                </v-btn>
              </div>
              <div v-else>
                <p class="italic text-sm font-medium">
                  This chore has been
                  <span
                    v-if="
                      chores?.filter((chore) => chore?._id === notification?.choreID)
                        .length > 0 &&
                      user?.id &&
                      chores?.filter((chore) => chore?._id === notification?.choreID)[0]
                        ?.assignee === user?.id
                    "
                  >
                    completed
                  </span>
                  <span
                    v-else-if="
                      user?.id &&
                      chores?.filter((chore) => chore?._id === notification?.choreID)[0]
                        ?.assignee &&
                      chores?.filter((chore) => chore?._id === notification?.choreID)[0]
                        ?.assignee !== user?.id
                    "
                  >
                    reassigned
                  </span>
                  <span
                    v-else-if="
                      chores?.filter(
                        (chore) => chore?._id === notification?.choreID
                      )[0] &&
                      !chores?.filter((chore) => chore?._id === notification?.choreID)[0]
                        ?.assignee
                    "
                  >
                    unassigned
                  </span>
                  <span v-else>deleted</span>
                </p>
              </div>
            </div>
          </v-list-item>
        </div>
      </div>
    </v-card>

    <p id="page_paragraph" class="w-[90%] text-white mx-auto mt-7 text-xl font-semibold">
      Delete Notifications
    </p>
    <p class="w-[90%] mx-auto text-white font-light">
      Select this option to remove all notifications from your inbox
    </p>

    <div class="w-[90%] mx-auto mb-16 mt-2">
      <v-btn
        :disabled="loading || notifications.length < 1"
        @click="deleteAll()"
        color="error"
        size="large"
        class="rounded-lg"
        >Delete All</v-btn
      >
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onBeforeMount } from "vue";
import {
  notifications,
  unreadCount,
  readNotification,
  deleteNotifications,
  supportNotification,
  loading,
} from "../../util/useNotifications";
import { chores, fetchChores, declineChoreAssignment } from "../../util/useChores";
import { user } from "../../util/userInfo";

const notificationDates = ref([]);
const reason = ref("");
const showErrorMessage = ref(false);

// Set the notification dates & item count
watch(
  notifications,
  (currentValue) => {
    if (currentValue.length > 0) {
      notificationDates.value = [];

      for (var i = currentValue.length - 1; i >= 0; i--) {
        const date = new Date(currentValue[i].date);
        date.setHours(0, 0, 0, 0);

        const dateCount = notificationDates.value.filter(
          (notification) => notification.date === date.getTime()
        ).length;

        if (dateCount > 0) {
          notificationDates.value.push({});
          continue;
        }

        const dateObj = {
          date: date.getTime(),
          index: i,
        };

        notificationDates.value.push(dateObj);
      }
    }
  },
  { deep: true, immediate: true }
);

function formatDate(notificationDate) {
  const notifDate = new Date(notificationDate);
  notifDate.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (notifDate.getTime() === today.getTime()) {
    return "Today";
  }

  const fullDate = new Date(notificationDate);
  const day = fullDate.toLocaleDateString("en-GB", { weekday: "long" });
  const month = fullDate.toLocaleDateString("en-GB", { month: "long" });
  const year = fullDate.getFullYear();

  var date = fullDate.getDate() + "";
  var lastDigit = date.charAt(date.length - 1);

  if (lastDigit === "1") {
    date += "st";
  } else if (lastDigit === "2") {
    date += "nd";
  } else if (lastDigit === "3") {
    date += "rd";
  } else {
    date += "th";
  }

  return day + " " + date + " " + month + " " + year;
}

function formatTime(notificationDate) {
  const fullDate = new Date(notificationDate);
  var hrs = fullDate.getHours() + "";
  var mins = fullDate.getMinutes() + "";

  if (hrs.length < 2) {
    hrs = "0" + hrs;
  }

  if (mins.length < 2) {
    mins = "0" + mins;
  }

  return " at " + hrs + ":" + mins;
}

function markAsRead(notificationId, isRead) {
  if (isRead || loading.value) {
    return;
  }

  readNotification(notificationId);
}

function declineChore(choreId, notificationId, isRead) {
  reason.value = reason.value.trim();

  if (reason.value === "") {
    showErrorMessage.value = true;
    return;
  }

  showErrorMessage.value = false;

  declineChoreAssignment(choreId, reason.value);
  markAsRead(notificationId, isRead);

  reason.value = "";
}

function deleteAll() {
  if (notifications.value.length < 1) {
    return;
  }

  if (!confirm("Are you sure you wish to delete all of your notifications?")) {
    return;
  }

  deleteNotifications();
}

onBeforeMount(() => {
  if (chores.value.length < 1) {
    fetchChores();
  }
});
</script>

<style>
#page_heading {
  text-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
}

#page_paragraph {
  text-shadow: 0 0 10px rgba(0, 0, 0, 0.25);
}

#chore_box {
  box-shadow: rgba(50, 50, 93, 0.25) 0px 30px 60px -12px inset,
    rgba(0, 0, 0, 0.3) 0px 18px 36px -18px inset;
}

.completed-chore {
  color: rgba(0, 0, 0, 0.5) !important;
  background-color: rgba(255, 255, 255, 0.5) !important;
}

.new-chore {
  margin-bottom: 10px;
  color: white;
  font-weight: 600;
}
.new-chore::placeholder {
  color: rgb(255, 255, 255);
  opacity: 1;
  font-weight: 600;
}

.fullScreenItemBackground {
  top: -5%;
  right: 0;
  bottom: 0;
  left: 255px;
  background: rgba(0, 0, 0, 0.5);
}

.smallScreenItemBackground {
  top: -2%;
  right: 0;
  bottom: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.5);
}
</style>
