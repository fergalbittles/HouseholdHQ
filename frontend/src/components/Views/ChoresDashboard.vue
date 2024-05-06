<template>
  <div>
    <h1
      id="page_heading"
      class="w-[90%] text-white text-h4 mt-7 block mx-auto font-medium"
    >
      Chores
    </h1>

    <p class="w-[90%] mx-auto text-white font-light">
      Select a chore to see more information
    </p>

    <p id="page_paragraph" class="w-[90%] text-white mx-auto mt-6 text-xl font-semibold">
      {{ itemCount }} items
    </p>

    <v-card
      id="chore_box"
      class="w-[90%] mx-auto mt-2 rounded-lg !bg-gradient-to-r !from-emerald-500 !to-teal-800"
    >
      <v-tabs v-model="tab" class="text-white mb-7" show-arrows>
        <v-tab :disabled="loading" value="all">All</v-tab>
        <v-tab :disabled="loading" value="active">Active</v-tab>
        <v-tab :disabled="loading" value="completed">Completed</v-tab>
        <v-tab :disabled="loading" value="overdue">Overdue</v-tab>
        <v-tab :disabled="loading" value="mine">Mine</v-tab>
        <v-tab :disabled="loading" value="unassigned">Unassigned</v-tab>
      </v-tabs>
      <div v-if="itemCount === 0">
        <p class="my-4 text-white text-lg text-center italic">
          {{
            tab === "all"
              ? "There aren't any chores"
              : tab === "active"
              ? "There aren't any active chores"
              : tab === "completed"
              ? "There aren't any completed chores"
              : tab === "overdue"
              ? "There aren't any overdue chores"
              : tab === "mine"
              ? "There aren't any chores assigned to you"
              : "There aren't any unassigned chores"
          }}
        </p>
      </div>
      <draggable
        @end="updateChores"
        tag="ul"
        :list="chores"
        item-key="_id"
        handle=".handle"
      >
        <template #item="{ element }">
          <div
            v-if="filter(element)"
            @click="goToChore(element._id)"
            class="w-[96.5%] h-[72px] !rounded-lg mx-auto my-4 py-3 pl-3 m-auto flex shadow-xl bg-white cursor-pointer"
            :class="{
              'completed-chore': element.isCompleted,
              '!bg-red-300': overdueChore(element),
            }"
          >
            <v-list-item
              :prepend-icon="
                element.isCompleted
                  ? 'mdi-check-circle-outline'
                  : overdueChore(element)
                  ? 'mdi-clock-alert-outline'
                  : null
              "
              class="w-[92.5%]"
              :title="element.title"
              :value="element.title"
              :subtitle="element.description"
            />
            <v-icon
              class="w-[7.5%] handle cursor-grab mx-auto my-auto pr-3 h-[100%]"
              icon="mdi-drag-vertical"
            ></v-icon>
          </div>
        </template>
      </draggable>

      <input
        :disabled="loading"
        type="text"
        class="new-chore block my-4 mx-auto pa-4 text-white rounded-lg w-[96.5%] h-[65px]"
        :class="{
          'border-solid': addChoreError || error,
          'border-[2px]': addChoreError || error,
          'border-[#f00]': addChoreError || error,
        }"
        placeholder="+ Enter new chore"
        v-model="choreInput"
        @keyup.enter="createChoreValidation"
      />
    </v-card>

    <div class="w-[90%] mx-auto mt-7">
      <v-btn
        :disabled="loading"
        @click="createChoreValidation"
        color="success"
        size="large"
        class="rounded-lg mt-3"
        >Add Chore</v-btn
      >
    </div>
    <p v-if="error.length > 0" class="w-[90%] mx-auto mt-3 mb-16 text-red font-semibold">
      {{ error }}
    </p>
    <p
      v-else
      class="w-[90%] mx-auto mt-3 mb-16 text-white font-light"
      :class="{ 'text-red': addChoreError, 'font-semibold': addChoreError }"
    >
      <span v-if="addChoreError">You must e</span><span v-else>E</span>nter a chore title
      in the input field above
    </p>

    <div
      class="fixed"
      :class="{
        fullScreenItemBackground: name !== 'xs' && name !== 'sm',
        smallScreenItemBackground: name === 'xs' || name === 'sm',
      }"
      v-if="isChoreOpen"
      @click.self="close"
    >
      <router-view />
    </div>
  </div>
</template>

<script setup>
import { watch, computed, onBeforeMount, ref } from "vue";
import draggable from "vuedraggable";
import { useRouter, useRoute } from "vue-router";
import {
  chores,
  fetchChores,
  createChore,
  currentChore,
  updateChoreList,
  loading,
} from "../../util/useChores";
import { user } from "../../util/userInfo";
import { fetchHouseholdInfo, household } from "../../util/useHousehold";
import { useDisplay } from "vuetify";

const itemCount = ref(0);
const tab = ref("all");
const { name } = useDisplay();
const router = useRouter();
const route = useRoute();
const choreInput = ref("");
const error = ref("");
const addChoreError = ref(false);

// Set the item count based on the list of chores
watch(
  chores,
  (currentValue) => {
    if (tab.value === "all") {
      itemCount.value = currentValue.length;
    } else if (tab.value === "active") {
      itemCount.value = currentValue.filter((chore) => !chore.isCompleted).length;
    } else if (tab.value === "completed") {
      itemCount.value = currentValue.filter((chore) => chore.isCompleted).length;
    } else if (tab.value === "overdue") {
      var now = new Date();

      itemCount.value = currentValue.filter((chore) => {
        if (chore.isCompleted) {
          return null;
        }

        if (chore.dateDue) {
          const bool = new Date(chore.dateDue).getTime() <= now.getTime();

          return bool ? chore : null;
        }
      }).length;
    } else if (tab.value === "mine") {
      itemCount.value = currentValue.filter(
        (chore) => chore.assignee === user.value?.id
      ).length;
    } else if (tab.value === "unassigned") {
      itemCount.value = currentValue.filter((chore) => !chore.assignee).length;
    }
  },
  { deep: true, immediate: true }
);

// Set the item count based on filter applied
watch(
  tab,
  (currentValue) => {
    addChoreError.value = false;
    error.value = "";

    if (currentValue === "all") {
      itemCount.value = chores.value?.length;
    } else if (currentValue === "active") {
      itemCount.value = chores.value?.filter((chore) => !chore.isCompleted).length;
    } else if (currentValue === "completed") {
      itemCount.value = chores.value?.filter((chore) => chore.isCompleted).length;
    } else if (currentValue === "overdue") {
      var now = new Date();

      itemCount.value = chores.value?.filter((chore) => {
        if (chore.isCompleted) {
          return null;
        }

        if (chore.dateDue) {
          const bool = new Date(chore.dateDue).getTime() <= now.getTime();

          return bool ? chore : null;
        }
      }).length;
    } else if (currentValue === "mine") {
      itemCount.value = chores.value?.filter(
        (chore) => chore.assignee === user.value?.id
      ).length;
    } else if (tab.value === "unassigned") {
      itemCount.value = chores.value?.filter((chore) => !chore.assignee).length;
    }
  },
  { immediate: true }
);

const isChoreOpen = computed(() => {
  return route.name === "chore";
});

function createChoreValidation() {
  choreInput.value = choreInput.value.trim();
  addChoreError.value = false;
  error.value = "";

  if (choreInput.value.length === 0) {
    addChoreError.value = true;
    return;
  }

  if (choreInput.value.length < 2) {
    // Display an error message
    error.value = "The chore title must be at least 2 characters long";
    return;
  }

  createChore(choreInput.value);

  choreInput.value = "";
}

function filter(chore) {
  if (tab.value === "all") {
    return true;
  } else if (tab.value === "active") {
    return !chore.isCompleted;
  } else if (tab.value === "completed") {
    return chore.isCompleted;
  } else if (tab.value === "overdue") {
    if (chore.isCompleted) {
      return false;
    }

    var now = new Date();
    var bool = false;

    if (chore.dateDue) {
      bool = new Date(chore.dateDue).getTime() <= now.getTime();
    }

    return bool;
  } else if (tab.value === "mine") {
    return chore.assignee === user.value?.id;
  } else if (tab.value === "unassigned") {
    return !chore.assignee;
  }
}

function overdueChore(chore) {
  var result = false;

  if (chore.isCompleted) {
    return result;
  }

  if (chore.dateDue) {
    // Get todays date
    var today = Date.now();
    today = new Date(today);
    today.setHours(0, 0, 0, 0);

    // Get due date
    var dueDate = new Date(chore.dateDue);
    dueDate.setHours(0, 0, 0, 0);

    result = dueDate < today;
  }

  return result;
}

function goToChore(id) {
  error.value = "";
  addChoreError.value = false;
  choreInput.value = "";

  router.push({ name: "chore", params: { id: id } });
}

function close() {
  currentChore.value = null;
  error.value = "";
  addChoreError.value = false;
  choreInput.value = "";

  router.push({ name: "chores" });
}

function updateChores() {
  const updatedChoreList = [];

  for (var i = 0; i < chores.value.length; i++) {
    updatedChoreList.push(chores.value[i]._id);
  }

  updateChoreList(updatedChoreList);
}

onBeforeMount(() => {
  if (!household.value) {
    fetchHouseholdInfo();
  }

  fetchChores();
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
