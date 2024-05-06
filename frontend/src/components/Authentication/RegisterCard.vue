<template>
  <v-card
    class="mx-auto px-6 pb-8 pt-10 !rounded-t-none rounded-b-lg !shadow-none"
    title="User Registration"
  >
    <v-form @submit.prevent="sendRegisterRequest">
      <v-container>
        <v-text-field
          v-model="first"
          class="mb-2"
          label="First name"
          :readonly="loading"
          clearable
        ></v-text-field>

        <v-text-field
          v-model="last"
          class="mb-2"
          label="Last name"
          :readonly="loading"
          clearable
        ></v-text-field>

        <v-text-field
          v-model="email"
          class="mb-2"
          label="Email"
          :readonly="loading"
          clearable
        ></v-text-field>

        <v-text-field
          v-model="password"
          label="Password"
          placeholder="Enter your password"
          :type="password ? 'password' : 'text'"
          :readonly="loading"
          clearable
        ></v-text-field>

        <p
          class="text-xs pb-2 font-medium text-gray-500"
          :class="{ 'text-green': validPassword }"
        >
          Password must contain the following:
        </p>
        <p
          class="text-xs pb-1 pl-2 font-medium text-gray-500"
          :class="{ 'text-green': passwordHasLowerCase }"
        >
          <v-icon
            class="pb-1 mr-2"
            :color="passwordHasLowerCase ? 'green-darken-2' : 'gray-500'"
            :icon="passwordHasLowerCase ? 'mdi-check' : 'mdi-close'"
          ></v-icon
          >A lower case letter
        </p>
        <p
          class="text-xs pb-1 pl-2 font-medium text-gray-500"
          :class="{ 'text-green': passwordHasUpperCase }"
        >
          <v-icon
            class="pb-1 mr-2"
            :color="passwordHasUpperCase ? 'green-darken-2' : 'gray-500'"
            :icon="passwordHasUpperCase ? 'mdi-check' : 'mdi-close'"
          ></v-icon
          >An upper case letter
        </p>
        <p
          class="text-xs pb-1 pl-2 font-medium text-gray-500"
          :class="{ 'text-green': passwordHasNumber }"
        >
          <v-icon
            class="pb-1 mr-2"
            :color="passwordHasNumber ? 'green-darken-2' : 'gray-500'"
            :icon="passwordHasNumber ? 'mdi-check' : 'mdi-close'"
          ></v-icon
          >A number
        </p>
        <p
          class="text-xs pl-2 font-medium text-gray-500"
          :class="{ 'text-green': passwordIsEightCharacters }"
        >
          <v-icon
            class="pb-1 mr-2"
            :color="passwordIsEightCharacters ? 'green-darken-2' : 'gray-500'"
            :icon="passwordIsEightCharacters ? 'mdi-check' : 'mdi-close'"
          ></v-icon
          >Minimum 8 characters
        </p>

        <p
          class="w-[90%] text-red-600 italic text-center font-medium mx-auto mt-5"
          v-if="errorMessage"
        >
          {{ errorMessage }}
        </p>

        <v-btn
          :disabled="!allInputProvided || !validPassword || loading"
          block
          color="teal-darken-2"
          size="large"
          type="submit"
          variant="elevated"
          class="mt-6"
        >
          Complete Registration
        </v-btn>
      </v-container>
    </v-form>
  </v-card>
</template>

<script setup>
import axios from "axios";
import { ref, computed, watch } from "vue";
import { API_URL } from "../../config";
import { validateName, validateEmail, validatePassword } from "./validateInputFields";
import { useRouter } from "vue-router";

const router = useRouter();
const emit = defineEmits(["loading"]);
const loading = ref(false);
const first = ref("");
const last = ref("");
const email = ref("");
const password = ref("");
const errorMessage = ref("");

// If input values are cleared, remove error message
watch(first, (currentValue) => {
  if (!currentValue) {
    errorMessage.value = "";
  }
});
watch(last, (currentValue) => {
  if (!currentValue) {
    errorMessage.value = "";
  }
});
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

const allInputProvided = computed(() => {
  return first.value && last.value && email.value && password.value;
});

const passwordHasLowerCase = computed(() => {
  for (let i = 0; i < password.value?.length; i++) {
    const char = password.value.charAt(i);

    if (char === char.toLowerCase() && /[a-zA-Z]/.test(char)) {
      return true;
    }
  }

  return false;
});

const passwordHasUpperCase = computed(() => {
  for (let i = 0; i < password.value?.length; i++) {
    const char = password.value.charAt(i);

    if (char === char.toUpperCase() && /[a-zA-Z]/.test(char)) {
      return true;
    }
  }

  return false;
});

const passwordHasNumber = computed(() => {
  for (let i = 0; i < password.value?.length; i++) {
    const char = password.value.charAt(i);

    if (!isNaN(char) && char !== " ") {
      return true;
    }
  }

  return false;
});

const passwordIsEightCharacters = computed(() => {
  return password.value?.length >= 8;
});

const validPassword = computed(() => {
  return (
    passwordHasLowerCase.value &&
    passwordHasUpperCase.value &&
    passwordHasNumber.value &&
    passwordIsEightCharacters.value
  );
});

const fullName = computed(() => {
  var fullName = first.value + " " + last.value;
  fullName = fullName.toLowerCase();
  const strArray = fullName.split(" ");

  for (let i = 0; i < strArray.length; i++) {
    strArray[i] = strArray[i].charAt(0).toUpperCase() + strArray[i].substring(1);
  }

  fullName = strArray.join(" ");

  return fullName;
});

const sendRegisterRequest = async () => {
  errorMessage.value = "";
  email.value = email.value.trim();
  first.value = first.value.trim();
  last.value = last.value.trim();
  email.value = email.value.toLocaleLowerCase();

  if (!allInputProvided.value) {
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

  var validName = validateName(fullName.value);
  if (validName !== true) {
    errorMessage.value = validName;
    return;
  }

  loading.value = true;
  emit("loading", loading.value);

  axios
    .post(API_URL + "/api/user/register", {
      name: fullName.value,
      email: email.value,
      password: password.value,
    })
    .then((res) => {
      const token = res.headers["auth-token"];
      localStorage.setItem("SavedToken", token);
      const householdId = res.data.household;

      if (!householdId) {
        router.push({ path: "/welcome/household" });
      } else {
        // Go to the household dashboard
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
