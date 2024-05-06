<template>
  <v-card
    class="mx-auto px-6 pb-8 pt-10 !rounded-t-none rounded-b-lg !shadow-none"
    title="User Login"
  >
    <v-form @submit.prevent="sendLoginRequest">
      <v-container>
        <v-text-field
          v-model="email"
          class="mb-2"
          clearable
          label="Email"
          :readonly="loading"
        ></v-text-field>

        <v-text-field
          v-model="password"
          clearable
          label="Password"
          placeholder="Enter your password"
          :type="password ? 'password' : 'text'"
          :readonly="loading"
        ></v-text-field>

        <p
          class="w-[90%] text-red-600 italic text-center font-medium mx-auto"
          v-if="errorMessage"
        >
          {{ errorMessage }}
        </p>

        <v-btn
          :disabled="!email || !password || loading"
          block
          color="teal-darken-2"
          size="large"
          type="submit"
          variant="elevated"
          class="mt-6"
        >
          Sign In
        </v-btn>
      </v-container>
    </v-form>
  </v-card>
</template>

<script setup>
import axios from "axios";
import { ref, watch } from "vue";
import { API_URL } from "../../config";
import { validateEmail, validatePassword } from "./validateInputFields";
import { useRouter } from "vue-router";

const router = useRouter();
const emit = defineEmits(["loading"]);
const loading = ref(false);
const email = ref("");
const password = ref("");
const errorMessage = ref("");

// If email or password are cleared, remove error message
watch(email, (currentValue) => {
  if (!currentValue) {
    errorMessage.value = "";
  }
});
watch(password, (currentValue) => {
  if (!currentValue) {
    errorMessage.value = "";
  }
});

const sendLoginRequest = async () => {
  errorMessage.value = "";
  email.value = email.value.trim();
  email.value = email.value.toLocaleLowerCase();

  if (!email.value || !password.value) {
    return;
  }

  var validEmail = validateEmail(email.value);
  if (validEmail !== true) {
    errorMessage.value = validEmail;
    return;
  }

  var validPassword = validatePassword(password.value);
  if (validPassword !== true) {
    errorMessage.value = validPassword;
    return;
  }

  loading.value = true;
  emit("loading", loading.value);

  axios
    .post(API_URL + "/api/user/login", { email: email.value, password: password.value })
    .then((res) => {
      const token = res.headers["auth-token"];
      localStorage.setItem("SavedToken", token);
      const householdId = res.data.household;

      if (!householdId) {
        router.push({ path: "/welcome/household" });
      } else {
        // PUSH ROUTE STRAIGHT TO HOUSEHOLD DASHBOARD
        router.push({ path: "/" });
      }
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
