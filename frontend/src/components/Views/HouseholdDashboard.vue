<template>
  <div>
    <h1
      id="page_heading"
      class="w-[90%] text-white text-h4 mt-7 block mx-auto font-medium"
    >
      {{ household?.name }}
    </h1>

    <p id="page_paragraph" class="w-[90%] text-white mx-auto mt-4 text-xl font-semibold">
      {{ members?.length }} members
    </p>
    <p
      v-if="members?.length >= 10"
      id="page_paragraph"
      class="w-[90%] text-slate-700 mx-auto text-md font-medium"
    >
      Your household has reached the maximum amount of members
    </p>

    <v-card
      title="Unique Household ID"
      subtitle="Use this ID to invite new household members"
      class="w-[90%] mx-auto mt-6 rounded-lg !shadow-2xl"
    >
      <p class="px-4 pb-4 font-bold text-lg text-green-700">{{ household?._id }}</p>
      <v-btn
        v-if="members?.length < 10"
        :disabled="loading || inviteResponse !== null"
        @click="
          isLeaveModalOpen = false;
          isInviteModalOpen = true;
        "
        color="success"
        class="rounded-lg mx-4 mb-4"
        prepend-icon="mdi-account-plus-outline"
      >
        Invite Member
      </v-btn>
      <p
        v-if="showInviteResponseSuccess"
        class="mx-5 mb-4 italic text-green font-semibold"
      >
        Invitation Successful
      </p>
      <p v-if="showInviteResponseError" class="mx-5 mb-4 italic text-red font-semibold">
        {{ inviteResponse?.message }}
      </p>
    </v-card>

    <v-card
      title="Household Members"
      subtitle="A household can have up to 10 members"
      class="w-[90%] mx-auto mt-6 rounded-lg pb-4 !shadow-2xl"
    >
      <div
        v-for="(member, i) in members"
        :key="i"
        class="px-4 pb-1 font-bold text-lg text-green-700 flex"
      >
        <v-avatar size="36px" class="profilePhotoShadow mr-3 my-2 block font-medium">
          <v-img
            alt="Avatar"
            :src="
              member?.profilePhoto > -1
                ? 'https://xsgames.co/randomusers/assets/avatars/pixel/' +
                  member?.profilePhoto +
                  '.jpg'
                : require('../../assets/avatar.jpeg')
            "
          ></v-img>
        </v-avatar>
        <p class="my-auto">
          {{ member?.name }}
        </p>
      </div>
    </v-card>

    <div v-if="household?.completedChoreCounter || currentChoreTotal > 0">
      <p
        id="page_paragraph"
        class="w-[90%] text-white mx-auto mt-10 text-xl font-semibold"
      >
        Chore Tracker
      </p>
      <p class="w-[90%] mx-auto text-white font-light">
        Track your overall chore progress as a household
      </p>
    </div>

    <v-card
      v-if="household?.completedChoreCounter"
      title="Chores Completed ✅"
      subtitle="The total of all chores that have been completed"
      class="w-[90%] mx-auto mt-4 rounded-lg pb-4 !shadow-2xl !bg-gradient-to-r !from-amber-300 !to-orange-500 !text-amber-900"
    >
      <p class="px-4 pb-1 font-bold text-lg text-amber-900">
        {{ household?.completedChoreCounter }} chore<span
          v-if="household?.completedChoreCounter > 1"
          >s</span
        >
      </p>
    </v-card>

    <v-card
      v-if="household?.completedChoreStreak"
      title="Chore Streak 🔥"
      subtitle="Complete chores daily to increase your streak!"
      class="w-[90%] mx-auto mt-6 rounded-lg pb-4 !shadow-2xl !bg-gradient-to-r !from-lime-300 !to-lime-700 !text-lime-900"
    >
      <p class="px-4 pb-1 font-bold text-lg text-lime-900">
        {{ household?.completedChoreStreak }} day<span
          v-if="household?.completedChoreStreak > 1"
          >s</span
        >
      </p>
    </v-card>

    <v-card
      v-if="currentChoreTotal > 0"
      title="Chore Progress"
      :subtitle="
        currentChoreTotal > 0 && currentChoreTotal === completedChoreCount
          ? 'All outstanding chores have been completed!'
          : 'Complete outstanding chores to make progress!'
      "
      class="w-[90%] mx-auto mt-6 rounded-lg pb-4 pr-8 !shadow-2xl"
    >
      <p class="px-4 pb-1 font-bold text-lg">
        {{ progressBarPercentage }} of chores are completed
      </p>
      <div class="w-full rounded-lg bg-gray-200 h-[35px] mx-4 mb-3">
        <div
          class="rounded-lg h-[35px] bg-green-500 w-[0]"
          :style="{ width: progressBarPercentage }"
        ></div>
      </div>
    </v-card>

    <v-card
      v-if="unassignedChoreCount > 0 || randomChore"
      title="Unassigned Chores ❔"
      subtitle="Unassigned chores are less likely to get completed"
      class="w-[90%] mx-auto mt-6 rounded-lg pb-4 !shadow-2xl !bg-gradient-to-r !from-purple-300 !to-purple-700 !text-purple-900"
    >
      <p
        v-if="unassignedChoreCount > 0"
        class="mx-4 pb-1 font-bold text-lg text-purple-900"
      >
        {{ unassignedChoreCount }} chore<span v-if="unassignedChoreCount > 1">s</span>
      </p>

      <div
        v-if="!randomChore"
        class="date-box rounded-lg mx-4 mb-2 pa-4 pb-8 mt-2 bg-white"
      >
        <div class="flex mt-8 mx-auto w-fit">
          <DiceIcon @click="rollDice()" />
          <p class="text-gray-400 w-fit pl-5 my-auto text-lg">
            Click the dice to randomly assign a chore
          </p>
        </div>

        <div>
          <p
            class="text-gray-400 text-center text-lg w-[100%] mt-5 mb-[20px] leading-[0.1em] border-b-[1px] border-solid border-[##6b7280]"
          >
            <span class="bg-[#fff] py-[10px] px-[10px]">or</span>
          </p>

          <div class="flex mt-5 mx-auto w-fit">
            <p class="text-gray-400 w-fit pr-5 my-auto text-lg">
              Click the button to assign a random chore to yourself
            </p>
            <v-btn
              @click="selfAssign()"
              icon="mdi-account-check"
              class="bg-emerald-400 text-white hover:bg-emerald-500"
              size="large"
            ></v-btn>
          </div>
        </div>
      </div>

      <div v-else class="date-box rounded-lg mx-4 mb-2 pa-4 mt-2 bg-white">
        <p class="mb-2 font-bold text-lg text-green-700">{{ randomChore.title }}</p>
        <p>This chore has been assigned to {{ randomChoreAssignee() }}</p>
        <v-btn
          class="mt-4"
          :disabled="loading"
          variant="flat"
          color="info"
          @click="$router.push('/chores/' + randomChore._id)"
        >
          Go To Chore
        </v-btn>
      </div>
    </v-card>

    <v-card
      v-if="overdueChoreCount > 0"
      title="Overdue Chores ⌛️"
      subtitle="Some chores have not been completed on time"
      class="w-[90%] mx-auto mt-6 rounded-lg pb-4 !shadow-2xl !bg-gradient-to-r !from-rose-300 !to-rose-700 !text-rose-900"
    >
      <p class="px-4 pb-1 font-bold text-lg text-rose-900">
        {{ overdueChoreCount }} chore<span v-if="overdueChoreCount > 1">s</span>
      </p>
      <v-btn
        class="mx-4 my-2 !bg-rose-900 text-white"
        :disabled="loading"
        @click="$router.push('/chores')"
      >
        Go To Chores
      </v-btn>
    </v-card>

    <p id="page_paragraph" class="w-[90%] text-white mx-auto mt-10 text-xl font-semibold">
      Leave the household
    </p>
    <p class="w-[90%] mx-auto text-white font-light">
      Select this option if you no longer wish to be a member of this household
    </p>

    <div class="w-[90%] mx-auto mb-16 mt-4">
      <v-btn
        :disabled="loading"
        @click="
          isInviteModalOpen = false;
          isLeaveModalOpen = true;
        "
        color="error"
        size="large"
        class="rounded-lg"
        >Leave Household</v-btn
      >
    </div>

    <div
      class="fixed"
      :class="{
        fullScreenModalBackground: name !== 'xs' && name !== 'sm',
        smallScreenModalBackground: name === 'xs' || name === 'sm',
      }"
      v-if="isModalOpen"
      @click.self="closeModal()"
    >
      <v-card
        v-if="isInviteModalOpen && !isLeaveModalOpen"
        title="Invite a New Member"
        subtitle="Enter an email address to send an invite"
        class="w-[80%] mx-auto mt-6 rounded-lg pb-4 !shadow-2xl bg-white"
      >
        <v-text-field
          v-model="email"
          class="mx-4"
          label="Email"
          :readonly="loading"
          clearable
          @keyup.enter="inviteUser()"
        ></v-text-field>

        <p
          class="mx-5 mb-5 text-red font-medium italic"
          v-if="inviteUserError.length > 0"
        >
          {{ inviteUserError }}
        </p>

        <v-btn
          v-if="members?.length < 10"
          :disabled="loading || !email"
          @click="inviteUser()"
          color="success"
          class="rounded-lg mx-4"
        >
          Send Invite
        </v-btn>

        <v-icon
          @click="closeModal()"
          icon="mdi-close"
          size="xs"
          class="absolute pt-[15px] pr-[15px] top-0 right-0 !hover:cursor-pointer"
        ></v-icon>
      </v-card>

      <v-card
        v-if="isLeaveModalOpen && !isInviteModalOpen"
        title="Leave the Household"
        subtitle="Please confirm that you wish to leave"
        class="w-[80%] mx-auto mt-6 rounded-lg pb-4 !shadow-2xl bg-white"
      >
        <p class="mx-4 mb-4">
          Enter the household name
          <b>{{ household?.name }}</b> to confirm that you wish to leave
        </p>

        <v-text-field
          v-model="householdNameInput"
          class="mx-4"
          label="Household Name"
          :readonly="loading"
          clearable
          @keyup.enter="leaveHouseholdConfirmation"
        ></v-text-field>

        <v-btn
          :disabled="loading || !matchingInput"
          @click="leaveHouseholdConfirmation"
          color="error"
          class="rounded-lg mx-4"
        >
          Leave Household
        </v-btn>

        <v-icon
          @click="closeModal()"
          icon="mdi-close"
          size="xs"
          class="absolute pt-[15px] pr-[15px] top-0 right-0 !hover:cursor-pointer"
        ></v-icon>
      </v-card>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed, onBeforeMount, onUnmounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { user } from "../../util/userInfo";
import {
  leaveHousehold,
  household,
  inviteMember,
  inviteResponse,
  loading,
} from "../../util/useHousehold";
import {
  chores,
  currentChore,
  fetchChores,
  assignChoreRandomly,
  assignChoreToSelf,
  randomChore,
  selfAssignConfirmation,
  selfRequestConfirmation,
  acceptRequestConfirmation,
  declineRequestConfirmation,
} from "../../util/useChores";
import DiceIcon from "../Chore/DiceIcon.vue";
import { useDisplay } from "vuetify";
import { validateEmail } from "../Authentication/validateInputFields";
import { notifications } from "../../util/useNotifications";

const router = useRouter();
const { path } = useRoute();
const members = ref([]);
const completedChoreCount = ref(null);
const overdueChoreCount = ref(null);
const unassignedChoreCount = ref(null);
const currentChoreTotal = ref(null);
const progressBarPercentage = ref(null);
const isInviteModalOpen = ref(false);
const isLeaveModalOpen = ref(false);
const inviteUserError = ref("");
const email = ref("");
const { name } = useDisplay();
const showInviteResponseSuccess = ref(false);
const showInviteResponseError = ref(false);
const householdNameInput = ref("");

const isModalOpen = computed(() => {
  return isInviteModalOpen.value || isLeaveModalOpen.value;
});

const matchingInput = computed(() => {
  return (
    householdNameInput.value?.trim().toLowerCase() ===
    household.value?.name?.trim().toLowerCase()
  );
});

// Reset the random chore if the route changes
watch(
  () => path,
  (newPath, oldPath) => {
    if (newPath !== oldPath) {
      randomChore.value = null;
    }
  }
);

// Set the household member names
watch(
  household,
  (currentValue) => {
    if (currentValue != null) {
      members.value = [];

      for (let i = 0; i < household?.value?.members?.length; i++) {
        members.value.push(household.value.members[i]);
      }
    }
  },
  { deep: true, immediate: true }
);

// Set the chore progress data
watch(
  chores,
  (currentValue) => {
    if (currentValue != null) {
      setCompletedChoreCount();
      setOverdueChoreCount();
      setUnassignedChoreCount();
      setCurrentChoreTotal();
      setProgressBar();
    }
  },
  { deep: true, immediate: true }
);

// Display a message to indicate successful invite sent
watch(
  inviteResponse,
  (currentValue) => {
    if (currentValue) {
      if (currentValue?.error) {
        // Show error message
        showInviteResponseSuccess.value = false;
        showInviteResponseError.value = true;
      } else {
        // Show success message
        showInviteResponseError.value = false;
        showInviteResponseSuccess.value = true;
      }

      setTimeout(() => {
        showInviteResponseError.value = false;
        showInviteResponseSuccess.value = false;
        inviteResponse.value = null;
      }, 3000);
    }
  },
  { immediate: true }
);

function setCompletedChoreCount() {
  completedChoreCount.value = chores.value.filter((chore) => chore.isCompleted).length;
}

function setOverdueChoreCount() {
  // Get todays date
  var today = Date.now();
  today = new Date(today);
  today.setHours(0, 0, 0, 0);

  overdueChoreCount.value = chores.value.filter((chore) => {
    if (chore.isCompleted) {
      return null;
    }

    if (chore.dateDue) {
      // Get due date
      var dueDate = new Date(chore.dateDue);
      dueDate.setHours(0, 0, 0, 0);

      const result = dueDate < today;

      return result ? chore : null;
    }
  }).length;
}

function setUnassignedChoreCount() {
  unassignedChoreCount.value = chores.value.filter(
    (chore) => !chore.assignee && !chore.isCompleted
  ).length;
}

function setCurrentChoreTotal() {
  currentChoreTotal.value = chores.value.length;
}

function setProgressBar() {
  const percentage = Math.floor(
    (completedChoreCount.value / currentChoreTotal.value) * 100
  );

  progressBarPercentage.value = percentage + "%";
}

function leaveHouseholdConfirmation() {
  leaveHousehold();

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

function rollDice() {
  if (loading.value || randomChore.value?.isCompleted) {
    return;
  }

  const unassignedChores = chores.value?.filter(
    (chore) => !chore.assignee && !chore.isCompleted
  );
  const randomChoreIndex = Math.floor(Math.random() * unassignedChores.length);
  const randomChoreId = unassignedChores[randomChoreIndex]._id;

  assignChoreRandomly(randomChoreId, true);

  const audio = new Audio(require("../../assets/dice_sound.mp3"));
  audio.play();
}

function selfAssign() {
  if (loading.value || randomChore.value?.isCompleted) {
    return;
  }

  const unassignedChores = chores.value?.filter(
    (chore) => !chore.assignee && !chore.isCompleted
  );
  const randomChoreIndex = Math.floor(Math.random() * unassignedChores.length);
  const randomChoreId = unassignedChores[randomChoreIndex]._id;

  assignChoreToSelf(randomChoreId, true);

  const audio = new Audio(require("../../assets/button_sound.mp3"));
  audio.play();
}

function randomChoreAssignee() {
  if (!randomChore.value) {
    return "a household member";
  }

  if (user.value?.id === randomChore.value?.assignee) {
    return "you";
  }

  const assignee = household.value?.members?.filter(
    (assignee) => assignee?._id === randomChore.value.assignee
  );

  if (assignee.length < 1) {
    return "unknown user";
  }

  return assignee[0].name;
}

function closeModal() {
  isLeaveModalOpen.value = false;
  isInviteModalOpen.value = false;
  email.value = "";
  inviteUserError.value = "";
  householdNameInput.value = "";
}

function inviteUser() {
  email.value = email.value.trim();

  if (email.value === "") {
    inviteUserError.value = "An email address must be provided";
    return;
  }

  var validEmail = validateEmail(email.value);
  if (validEmail !== true) {
    inviteUserError.value = validEmail;
    return;
  }

  // Send the invite API request
  inviteMember(email.value);

  // Close the modal
  closeModal();
}

onBeforeMount(() => {
  if (chores.value.length === 0) {
    fetchChores();
  }
});

onUnmounted(() => {
  randomChore.value = null;
});
</script>

<style>
.fullScreenModalBackground {
  padding-top: 200px;
  top: 0;
  right: 0;
  bottom: 0;
  left: 255px;
  background: rgba(0, 0, 0, 0.5);
}

.smallScreenModalBackground {
  padding-top: 250px;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.5);
}

.profilePhotoShadow {
  box-shadow: rgba(17, 17, 26, 0.1) 0px 4px 16px, rgba(17, 17, 26, 0.1) 0px 8px 24px,
    rgba(17, 17, 26, 0.1) 0px 16px 56px;
}
</style>
