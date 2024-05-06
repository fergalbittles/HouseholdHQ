<template>
  <v-card
    class="mx-auto px-6 pb-8 pt-10 rounded-t-none rounded-b-lg !shadow-none"
    title="Join a Household"
  >
    <p class="pl-4 text-slate-500">
      If you wish to join a household, ask an existing member to send you the unique
      household ID
    </p>
    <v-form @submit.prevent="sendJoinHouseholdRequest">
      <v-container>
        <v-text-field
          v-model="uniqueId"
          class="mb-2"
          clearable
          label="Unique Household ID"
          :readonly="loading"
        ></v-text-field>

        <p
          class="w-[90%] text-red-600 italic text-center font-medium mx-auto"
          v-if="errorMessage"
        >
          {{ errorMessage }}
        </p>

        <v-btn
          :disabled="!uniqueId || loading"
          block
          color="teal-darken-2"
          size="large"
          type="submit"
          variant="elevated"
          class="mt-6"
        >
          Join Household
        </v-btn>
      </v-container>
    </v-form>
  </v-card>
</template>

<script setup>
import axios from "axios";
import { ref, watch } from "vue";
import { API_URL } from "../../config";
import { validateHouseholdId } from "./validateInputFields";
import { useRouter } from "vue-router";

const router = useRouter();
const emit = defineEmits(["loading"]);
const loading = ref(false);
const uniqueId = ref("");
const errorMessage = ref("");

// If input values are cleared, remove error message
watch(uniqueId, (currentValue) => {
  if (!currentValue) {
    errorMessage.value = "";
  }
});

const sendJoinHouseholdRequest = async () => {
  errorMessage.value = "";
  uniqueId.value = uniqueId.value.trim();

  if (!uniqueId.value) {
    return;
  }

  var validHouseholdId = validateHouseholdId(uniqueId.value);
  if (validHouseholdId !== true) {
    errorMessage.value = validHouseholdId;
    return;
  }

  loading.value = true;
  emit("loading", loading.value);

  axios
    .patch(
      API_URL + "/api/household/join",
      {
        householdId: uniqueId.value,
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
