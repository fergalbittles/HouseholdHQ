<template>
  <div
    class="item-view w-[90%] max-w-[700px] max-h-[75%] relative flex flex-row bg-white pin mx-4 m-32 mx-auto py-4 text-left rounded-lg shadow"
  >
    <div
      v-if="invalidId"
      class="flex flex-col flex-grow items-start px-5 overflow-y-auto min-h-[300px]"
    >
      <h1 class="w-full text-h4 mb-5 mt-3 block font-medium border-solid">
        Invalid Chore ID
      </h1>
      <p class="text-lg">Please try again with a different chore ID</p>
    </div>
    <div
      v-else
      class="flex flex-col flex-grow items-start justify-between px-5 overflow-y-auto"
    >
      <h1 class="w-full text-h4 mb-5 mt-3 block font-medium">Chore Details</h1>
      <p class="mb-3" v-if="currentChore?.isCompleted">
        This chore has been completed and can no longer be updated or assigned
      </p>
      <p class="mb-3 text-red font-bold" v-if="isOverdue">
        This chore is overdue - Complete the chore or update the due date
      </p>

      <v-text-field
        id="chore-title"
        append-inner-icon="mdi-lead-pencil"
        label="Title"
        class="mt-2 w-full font-bold"
        :model-value="currentChore?.title"
        :disabled="currentChore?.isCompleted"
      />

      <v-textarea
        id="chore-description"
        label="Description"
        clearable
        :model-value="currentChore?.description"
        placeholder="Enter a description..."
        variant="filled"
        class="w-full mt-2"
        no-resize
        :disabled="currentChore?.isCompleted"
      ></v-textarea>

      <div class="date-box rounded-lg w-full mb-4 pa-4 pb-8 mt-2">
        <p
          class="px-6 py-1 text-lg mx-auto font-semibold block bg-teal-700 w-fit rounded-lg shadow-md text-white"
          :class="{ 'bg-gray-300': currentChore?.isCompleted }"
        >
          Assignee
        </p>

        <div v-if="!currentChore?.assignee" class="flex mt-8 mx-auto w-fit">
          <DiceIcon
            :class="{
              'bg-gray-300': currentChore?.isCompleted,
              'hover:bg-gray-300': currentChore?.isCompleted,
              'hover:cursor-not-allowed': currentChore?.isCompleted,
            }"
            @click="rollDice"
          />
          <p
            class="text-gray-400 w-fit pl-5 my-auto text-lg"
            :class="{
              'text-gray-300': currentChore?.isCompleted,
            }"
          >
            Click the dice to randomly assign this chore
          </p>
        </div>

        <div v-else class="mt-8 mx-auto w-fit text-center">
          <p
            :class="{
              'text-gray-300': currentChore?.isCompleted,
            }"
          >
            This chore has been
            <span v-if="currentChore?.isRandomAssignment">randomly</span> assigned to<span
              v-if="currentChore?.assignee === currentUser"
            >
              you</span
            >:
          </p>

          <div class="mt-3">
            <v-avatar
              size="35px"
              class="profilePhotoShadow mt-3 font-medium bottom-2"
              :class="{
                grayscale: currentChore?.isCompleted,
                'opacity-40': currentChore?.isCompleted,
              }"
            >
              <v-img
                alt="Avatar"
                :src="
                  household?.members?.find((x) => x._id === currentChore?.assignee)
                    ?.profilePhoto > -1
                    ? 'https://xsgames.co/randomusers/assets/avatars/pixel/' +
                      household?.members?.find((x) => x._id === currentChore?.assignee)
                        ?.profilePhoto +
                      '.jpg'
                    : require('../../assets/avatar.jpeg')
                "
              ></v-img>
            </v-avatar>
            <p
              class="font-bold text-lg text-green-700 inline ml-3"
              :class="{
                '!text-gray-300': currentChore?.isCompleted,
              }"
            >
              {{ choreAssignee }}
            </p>
          </div>

          <div
            v-if="
              currentChore?.isRandomAssignment &&
              currentChore?.assignee === currentUser &&
              !currentChore?.isCompleted
            "
          >
            <p class="mt-3">You can decline this chore with a provided reason:</p>
            <input
              class="mt-3 pl-2 w-[136.09px] rounded border-[1px] border-[#bbb] border-solid bg-[#eee]"
              :class="{
                'border-red-400': declineAssignmentError,
                'mb-2': !declineAssignmentError,
                'mb-1': declineAssignmentError,
              }"
              type="text"
              name="reason"
              placeholder="Reason..."
              v-model="reason"
            />
            <br />
            <p v-if="declineAssignmentError" class="text-red italic mb-1 text-sm">
              You must provide a reason to decline a chore
            </p>
            <v-btn
              @click="declineChore(currentChore._id)"
              :disabled="loading"
              variant="flat"
              color="error"
              size="small"
            >
              Decline Chore
            </v-btn>
          </div>
        </div>

        <div v-if="!(currentChore?.assignee === currentUser)">
          <p
            class="text-gray-400 text-center text-lg w-[100%] mt-5 mb-[20px] leading-[0.1em] border-b-[1px] border-solid border-[##6b7280]"
          >
            <span
              v-if="!currentChore?.assigneeRequestPending"
              class="bg-[#fff] py-[10px] px-[10px]"
              :class="{
                'text-gray-300': currentChore?.isCompleted,
              }"
              >or</span
            >
          </p>

          <div
            v-if="!currentChore?.assigneeRequestPending"
            class="flex mt-5 mx-auto w-fit"
          >
            <p
              class="text-gray-400 w-fit pr-5 my-auto text-lg"
              :class="{
                'text-gray-300': currentChore?.isCompleted,
              }"
            >
              Click the button to
              <span v-if="!currentChore?.assignee">assign this chore to yourself</span>
              <span v-else>request this chore for yourself</span>
            </p>
            <v-btn
              @click="currentChore?.assignee ? selfRequest() : selfAssign()"
              icon="mdi-account-check"
              class="bg-emerald-400 text-white hover:bg-emerald-500"
              :class="{
                'hover:cursor-not-allowed': currentChore?.isCompleted,
                'bg-gray-300': currentChore?.isCompleted,
                'hover:bg-gray-300': currentChore?.isCompleted,
              }"
              size="large"
            ></v-btn>
          </div>

          <div v-else class="mt-8 mx-auto w-fit text-center">
            <p
              :class="{
                'text-gray-300': currentChore?.isCompleted,
              }"
            >
              Assignment of this chore has been requested by<span
                v-if="currentChore?.assigneeRequestPending === currentUser"
              >
                you</span
              >:
            </p>

            <div class="mt-3">
              <v-avatar
                size="35px"
                class="profilePhotoShadow mt-3 font-medium bottom-2"
                :class="{
                  grayscale: currentChore?.isCompleted,
                  'opacity-40': currentChore?.isCompleted,
                }"
              >
                <v-img
                  alt="Avatar"
                  :src="
                    household?.members?.find(
                      (x) => x._id === currentChore?.assigneeRequestPending
                    )?.profilePhoto > -1
                      ? 'https://xsgames.co/randomusers/assets/avatars/pixel/' +
                        household?.members?.find(
                          (x) => x._id === currentChore?.assigneeRequestPending
                        )?.profilePhoto +
                        '.jpg'
                      : require('../../assets/avatar.jpeg')
                  "
                ></v-img>
              </v-avatar>
              <p
                class="font-bold text-lg text-green-700 inline ml-3"
                :class="{
                  '!text-gray-300': currentChore?.isCompleted,
                }"
              >
                {{ requestingChoreAssignee }}
              </p>
            </div>

            <p class="text-xs text-gray-300 mt-3">Request is currently pending</p>
          </div>
        </div>

        <div
          v-if="
            currentChore?.assigneeRequestPending && currentChore?.assignee === currentUser
          "
        >
          <v-divider class="my-5" />

          <div class="mt-8 mx-auto w-fit text-center">
            <p
              :class="{
                'text-gray-300': currentChore?.isCompleted,
              }"
            >
              Assignment of this chore has been requested by:
            </p>
            <div class="mt-3">
              <v-avatar
                size="35px"
                class="profilePhotoShadow mt-3 font-medium bottom-2"
                :class="{
                  grayscale: currentChore?.isCompleted,
                  'opacity-40': currentChore?.isCompleted,
                }"
              >
                <v-img
                  alt="Avatar"
                  :src="
                    household?.members?.find(
                      (x) => x._id === currentChore?.assigneeRequestPending
                    )?.profilePhoto > -1
                      ? 'https://xsgames.co/randomusers/assets/avatars/pixel/' +
                        household?.members?.find(
                          (x) => x._id === currentChore?.assigneeRequestPending
                        )?.profilePhoto +
                        '.jpg'
                      : require('../../assets/avatar.jpeg')
                  "
                ></v-img>
              </v-avatar>
              <p
                class="font-bold text-lg text-green-700 inline ml-3"
                :class="{
                  '!text-gray-300': currentChore?.isCompleted,
                }"
              >
                {{ requestingChoreAssignee }}
              </p>
            </div>
          </div>

          <div class="mt-5 mx-auto w-full flex justify-center">
            <v-btn
              :disabled="loading || currentChore?.isCompleted"
              @click="acceptRequest"
              color="success"
              class="mx-2 w-[105px]"
              >Accept</v-btn
            >
            <v-btn
              :disabled="loading || currentChore?.isCompleted"
              @click="declineRequest"
              color="error"
              class="mx-2 w-[105px]"
              >Decline</v-btn
            >
          </div>
        </div>
      </div>

      <v-select
        id="chore-priority"
        class="w-full mt-2"
        label="Priority"
        :model-value="currentChore?.priority ? currentChore?.priority : 'None'"
        :items="['None', 'Low', 'Medium', 'High']"
        :disabled="currentChore?.isCompleted"
      ></v-select>

      <div class="date-box rounded-lg w-full mb-4 pa-4 mt-2">
        <label class="mr-4 font-semibold text-lg" for="due-date">Date Due:</label>
        <input
          id="chore-due-date"
          :value="
            currentChore?.dateDue
              ? new Date(currentChore.dateDue).toISOString().split('T')[0]
              : null
          "
          name="due-date"
          class="rounded-lg pa-1 w-[80%]"
          type="date"
          :disabled="currentChore?.isCompleted"
        />
      </div>

      <div class="date-box rounded-lg mb-4 pa-3 w-[100%] mt-2">
        <div class="mb-2 pl-1">
          <p class="inline mr-4 font-semibold text-lg">Created by:</p>
          <p class="inline">{{ createdBy }}</p>
          <v-avatar size="25px" class="profilePhotoShadow ml-3 font-medium">
            <v-img
              alt="Avatar"
              :src="
                household?.members?.find((x) => x._id === currentChore?.createdBy)
                  ?.profilePhoto > -1
                  ? 'https://xsgames.co/randomusers/assets/avatars/pixel/' +
                    household?.members?.find((x) => x._id === currentChore?.createdBy)
                      ?.profilePhoto +
                    '.jpg'
                  : require('../../assets/avatar.jpeg')
              "
            ></v-img>
          </v-avatar>
        </div>

        <div class="pl-1">
          <p class="inline mr-4 font-semibold text-lg">Date Created:</p>
          <p class="inline">{{ dateCreated }}</p>
        </div>
      </div>

      <div
        v-if="updatedBy && !completedBy"
        class="date-box rounded-lg mb-4 pa-3 w-[100%] mt-2"
      >
        <div class="mb-2 pl-1">
          <p class="inline mr-4 font-semibold text-lg">Updated by:</p>
          <p class="inline">{{ updatedBy }}</p>
          <v-avatar size="25px" class="profilePhotoShadow ml-3 font-medium">
            <v-img
              alt="Avatar"
              :src="
                household?.members?.find((x) => x._id === currentChore?.updatedBy)
                  ?.profilePhoto > -1
                  ? 'https://xsgames.co/randomusers/assets/avatars/pixel/' +
                    household?.members?.find((x) => x._id === currentChore?.updatedBy)
                      ?.profilePhoto +
                    '.jpg'
                  : require('../../assets/avatar.jpeg')
              "
            ></v-img>
          </v-avatar>
        </div>

        <div class="pl-1">
          <p class="inline mr-4 font-semibold text-lg">Date Updated:</p>
          <p class="inline">{{ dateUpdated }}</p>
        </div>
      </div>

      <div v-if="completedBy" class="date-box rounded-lg mb-4 pa-3 w-[100%] mt-2">
        <div class="mb-2 pl-1">
          <p class="inline mr-4 font-semibold text-lg">Completed by:</p>
          <p class="inline">{{ completedBy }}</p>
          <v-avatar size="25px" class="profilePhotoShadow ml-3 font-medium">
            <v-img
              alt="Avatar"
              :src="
                household?.members?.find((x) => x._id === currentChore?.completedBy)
                  ?.profilePhoto > -1
                  ? 'https://xsgames.co/randomusers/assets/avatars/pixel/' +
                    household?.members?.find((x) => x._id === currentChore?.completedBy)
                      ?.profilePhoto +
                    '.jpg'
                  : require('../../assets/avatar.jpeg')
              "
            ></v-img>
          </v-avatar>
        </div>

        <div class="pl-1">
          <p class="inline mr-4 font-semibold text-lg">Date Completed:</p>
          <p class="inline">{{ dateCompleted }}</p>
        </div>
      </div>

      <div v-if="error.length > 0" class="date-box rounded-lg mb-4 pa-3 w-[100%] mt-2">
        <div class="pl-1">
          <p class="text-red text-center font-medium italic text-lg">
            {{ error }}
          </p>
        </div>
      </div>

      <div class="mt-5 pb-7 mx-auto w-full flex flex-wrap justify-between">
        <div v-if="!currentChore?.isCompleted" class="mx-auto">
          <v-btn
            @click="updateChoreConfirmation()"
            :disabled="loading"
            color="info"
            prepend-icon="mdi-content-save"
            class="!h-[50px] mb-5 w-[201px] mx-2"
            >Save Changes
          </v-btn>
        </div>
        <div v-if="!currentChore?.isCompleted" class="mx-auto">
          <v-btn
            @click="completeChoreConfirmation()"
            :disabled="loading"
            color="success"
            prepend-icon="mdi-check-circle"
            class="!h-[50px] mb-5 w-[201px] mx-2"
            >Complete Chore</v-btn
          >
        </div>
        <div class="mx-auto">
          <v-btn
            @click="deleteChoreConfirmation()"
            :disabled="loading"
            color="error"
            prepend-icon="mdi-delete-circle"
            class="!h-[50px] mb-5 w-[201px] mx-2"
            >Delete Chore
          </v-btn>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onBeforeMount, watch, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import {
  fetchChore,
  currentChore,
  updateChore,
  assignChoreToSelf,
  assignChoreRequest,
  assignChoreRandomly,
  respondToAssigneeRequest,
  completeChore,
  deleteChore,
  loading,
  declineChoreAssignment,
  selfAssignConfirmation,
  selfRequestConfirmation,
  acceptRequestConfirmation,
  declineRequestConfirmation,
} from "../../util/useChores";
import { household } from "../../util/useHousehold";
import { user } from "../../util/userInfo";
import DiceIcon from "../Chore/DiceIcon.vue";

const router = useRouter();
const { params } = useRoute();
const invalidId = ref(false);
const createdBy = ref(null);
const updatedBy = ref(null);
const completedBy = ref(null);
const dateCreated = ref(null);
const dateUpdated = ref(null);
const dateCompleted = ref(null);
const error = ref("");
const declineAssignmentError = ref(false);
const reason = ref("");
const isOverdue = ref(false);
const currentUser = ref(null);

watch(
  user,
  (currentValue) => {
    if (currentValue) {
      setCurrentUser();
    }
  },
  { deep: true, immediate: true }
);

watch(
  currentChore,
  (currentValue) => {
    if (!currentValue) {
      invalidId.value = true;
    } else {
      setDateCreated();
      setDateUpdated();
      setDateCompleted();

      invalidId.value = false;

      // Check if the chore is overdue
      if (currentChore.value.isCompleted) {
        isOverdue.value = false;
      } else {
        var result = false;

        if (currentChore.value.dateDue) {
          // Get todays date
          var today = Date.now();
          today = new Date(today);
          today.setHours(0, 0, 0, 0);

          // Get due date
          var dueDate = new Date(currentChore.value.dateDue);
          dueDate.setHours(0, 0, 0, 0);

          result = dueDate < today;
        }

        isOverdue.value = result;
      }
    }
  },
  { deep: true }
);

watch(loading, (currentValue) => {
  if (currentValue === true) {
    invalidId.value = false;
  } else {
    if (!currentChore.value) {
      invalidId.value = true;
    } else {
      invalidId.value = false;
    }
  }
});

const choreAssignee = computed(() => {
  var assigneeName = household?.value?.members?.find(
    (x) => x._id === currentChore?.value?.assignee
  )?.name;

  if (!assigneeName && currentChore?.value?.assignee) {
    assigneeName = "Unknown User";
  }

  return assigneeName;
});

const requestingChoreAssignee = computed(() => {
  var requestingUser = household?.value?.members?.find(
    (x) => x._id === currentChore?.value?.assigneeRequestPending
  )?.name;

  if (!requestingUser && currentChore?.value?.assigneeRequestPending) {
    requestingUser = "Unknown User";
  }

  return requestingUser;
});

function declineChore(choreId) {
  reason.value = reason.value.trim();

  if (reason.value === "") {
    declineAssignmentError.value = true;
    return;
  }

  declineAssignmentError.value = false;

  declineChoreAssignment(choreId, reason.value);

  reason.value = "";
}

function rollDice() {
  if (loading.value || currentChore.value.isCompleted) {
    return;
  }

  assignChoreRandomly(currentChore.value._id);

  if (currentChore.value) {
    const audio = new Audio(require("../../assets/dice_sound.mp3"));
    audio.play();
  }
}

function selfAssign() {
  if (loading.value || currentChore.value.isCompleted) {
    return;
  }

  if (!selfAssignConfirmation.value) {
    selfAssignConfirmation.value = true;

    if (!confirm("Are you sure you wish to assign this chore to yourself?")) {
      return;
    }
  }

  assignChoreToSelf(currentChore.value._id);

  if (currentChore.value) {
    const audio = new Audio(require("../../assets/button_sound.mp3"));
    audio.play();
  }
}

function selfRequest() {
  if (loading.value || currentChore.value.isCompleted) {
    return;
  }

  if (!selfRequestConfirmation.value) {
    selfRequestConfirmation.value = true;

    if (!confirm("Are you sure you wish to request this chore for yourself?")) {
      return;
    }
  }

  assignChoreRequest(currentChore.value._id);

  if (currentChore.value) {
    const audio = new Audio(require("../../assets/button_sound.mp3"));
    audio.play();
  }
}

function acceptRequest() {
  if (!acceptRequestConfirmation.value) {
    acceptRequestConfirmation.value = true;

    if (
      !confirm(
        "Are you sure you wish to assign this chore to " +
          requestingChoreAssignee.value +
          "?"
      )
    ) {
      return;
    }
  }

  respondToAssigneeRequest(currentChore.value._id, "accept");
}

function declineRequest() {
  if (!declineRequestConfirmation.value) {
    declineRequestConfirmation.value = true;

    if (!confirm("Are you sure you wish to decline this assignee request?")) {
      return;
    }
  }

  respondToAssigneeRequest(currentChore.value._id, "decline");
}

function setCurrentUser() {
  currentUser.value = user.value.id;
}

function updateChoreConfirmation() {
  if (confirm("Are you sure you wish to save the changes made to this chore?")) {
    saveChanges();
  }
}

function completeChoreConfirmation() {
  if (confirm("Are you sure you wish to mark this chore as complete?")) {
    completeChore(currentChore.value._id);
    pushToDashboard();
  }
}

function deleteChoreConfirmation() {
  if (confirm("Are you sure you wish to delete this chore?")) {
    deleteChore(currentChore.value._id);
    pushToDashboard();
  }
}

function setDateCreated() {
  // Set the created properties
  createdBy.value = household?.value?.members?.find(
    (x) => x._id === currentChore?.value?.createdBy
  )?.name;

  if (!createdBy.value && currentChore?.value?.createdBy) {
    createdBy.value = "Unknown User";
  }

  var varDateCreated = new Date(currentChore?.value?.dateCreated);
  var dd = varDateCreated.getDate();
  var mm = varDateCreated.getMonth() + 1;
  var yyyy = varDateCreated.getFullYear();

  if (dd < 10) dd = "0" + dd;
  if (mm < 10) mm = "0" + mm;

  dateCreated.value = dd + "/" + mm + "/" + yyyy;
}

function setDateUpdated() {
  // Set the updated properties
  updatedBy.value = household?.value?.members?.find(
    (x) => x._id === currentChore?.value?.updatedBy
  )?.name;

  if (!updatedBy.value && currentChore?.value?.updatedBy) {
    updatedBy.value = "Unknown User";
  }

  var varDateUpdated = new Date(currentChore?.value?.lastUpdated);
  var dd = varDateUpdated.getDate();
  var mm = varDateUpdated.getMonth() + 1;
  var yyyy = varDateUpdated.getFullYear();

  if (dd < 10) dd = "0" + dd;
  if (mm < 10) mm = "0" + mm;

  dateUpdated.value = dd + "/" + mm + "/" + yyyy;
}

function setDateCompleted() {
  // Set the completed properties
  completedBy.value = household?.value?.members?.find(
    (x) => x._id === currentChore?.value?.completedBy
  )?.name;

  if (!completedBy.value && currentChore?.value?.completedBy) {
    completedBy.value = "Unknown User";
  }

  var varDateCompleted = new Date(currentChore?.value?.dateCompleted);
  var dd = varDateCompleted.getDate();
  var mm = varDateCompleted.getMonth() + 1;
  var yyyy = varDateCompleted.getFullYear();

  if (dd < 10) dd = "0" + dd;
  if (mm < 10) mm = "0" + mm;

  dateCompleted.value = dd + "/" + mm + "/" + yyyy;
}

function pushToDashboard() {
  router.push({ name: "chores" });
}

function saveChanges() {
  const choreTitle = document.getElementById("chore-title").value.trim();
  const choreDescription = document.getElementById("chore-description").value.trim();
  const chorePriority = document.getElementById("chore-priority").value;
  const choreDueDate = document.getElementById("chore-due-date").value;

  if (choreTitle.length < 2 || choreTitle.length > 255) {
    error.value = "Invalid Input: Chore title must be between 2 and 255 characters long";
    return;
  }

  if (choreDescription.length > 2000) {
    error.value =
      "Invalid Input: Chore description must be less than 2000 characters long";
    return;
  }

  // Get todays date
  var today = Date.now();
  today = new Date(today);
  today.setHours(0, 0, 0, 0);

  // Get due date
  var dueDate = new Date(choreDueDate);
  dueDate.setHours(0, 0, 0, 0);

  if (dueDate < today) {
    error.value = "Invalid Input: Due date must be from today onwards";
    return;
  }

  error.value = "";

  updateChore(
    currentChore.value._id,
    choreTitle,
    choreDescription,
    chorePriority,
    choreDueDate
  );

  pushToDashboard();
}

onBeforeMount(() => {
  // Set the current chore
  fetchChore(params.id);
});
</script>

<style>
.item-view {
  box-shadow: rgba(0, 0, 0, 0.25) 0px 54px 55px, rgba(0, 0, 0, 0.12) 0px -12px 30px,
    rgba(0, 0, 0, 0.12) 0px 4px 6px, rgba(0, 0, 0, 0.17) 0px 12px 13px,
    rgba(0, 0, 0, 0.09) 0px -3px 5px;
}

.date-box {
  box-shadow: rgba(0, 0, 0, 0.15) 0px 2px 8px;
}
</style>
