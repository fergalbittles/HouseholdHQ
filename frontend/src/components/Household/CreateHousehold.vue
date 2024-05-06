<template>
  <v-card
    class="mx-auto px-6 pb-8 pt-10 rounded-t-none rounded-b-lg !shadow-none"
    title="Create a Household"
  >
    <p class="pl-4 text-slate-500">
      If you wish to create a new household, enter the desired household name below
    </p>
    <v-form @submit.prevent="sendCreateHouseholdRequest">
      <v-container>
        <v-text-field
          v-model="householdName"
          class="mb-2"
          clearable
          label="Household Name"
          :readonly="loading"
        ></v-text-field>

        <p
          class="w-[90%] text-red-600 italic text-center font-medium mx-auto"
          v-if="errorMessage"
        >
          {{ errorMessage }}
        </p>

        <v-btn
          :disabled="!householdName || loading"
          block
          color="teal-darken-2"
          size="large"
          type="submit"
          variant="elevated"
          class="mt-6"
        >
          Create Household
        </v-btn>
      </v-container>
    </v-form>
  </v-card>
</template>

<script setup>
import axios from "axios";
import { ref, watch } from "vue";
import { API_URL } from "../../config";
import { validateHouseholdName } from "./validateInputFields";
import { useRouter } from "vue-router";

const router = useRouter();
const emit = defineEmits(["loading"]);
const loading = ref(false);
const householdName = ref("");
const errorMessage = ref("");

// If input values are cleared, remove error message
watch(householdName, (currentValue) => {
  if (!currentValue) {
    errorMessage.value = "";
  }
});

const sendCreateHouseholdRequest = async () => {
  errorMessage.value = "";
  householdName.value = householdName.value.trim();

  if (!householdName.value) {
    return;
  }

  var validHouseholdName = validateHouseholdName(householdName.value);
  if (validHouseholdName !== true) {
    errorMessage.value = validHouseholdName;
    return;
  }

  loading.value = true;
  emit("loading", loading.value);

  axios
    .post(
      API_URL + "/api/household/create",
      {
        name: householdName.value,
      },
      {
        headers: {
          "auth-token": localStorage.getItem("SavedToken"),
        },
      }
    )
    .then(() => {
      // Push to dashboard
      router.push({ path: "/" });
    })
    .catch((err) => {
      if (err?.response?.status < 500) {
        errorMessage.value = err.response.data?.message;
      } else {
        errorMessage.value = "Unable to connect to server";
      }
    })
    .finally(() => {
      loading.value = false;
      emit("loading", loading.value);
    });
};
</script>
