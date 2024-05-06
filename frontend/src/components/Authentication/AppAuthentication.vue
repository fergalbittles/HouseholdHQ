<template>
  <div
    class="max-w-[500px] w-[90%] mt-7 mx-auto shadow-2xl rounded-lg border-solid border-2 border-black bg-white mb-6"
  >
    <v-tabs
      class="w-[100%] mx-auto rounded-t-lg"
      v-model="tab"
      bg-color="white"
      color="teal-darken-2"
      slider-color="teal-darken-2"
    >
      <v-tab :disabled="disableTabs" class="w-1/2" value="one">Login</v-tab>
      <v-tab :disabled="disableTabs" class="w-1/2" value="two">Register</v-tab>
    </v-tabs>

    <LoginCard v-if="tab == 'one'" @loading="loading" />
    <RegisterCard v-else @loading="loading" />
  </div>
</template>

<script setup>
import { ref } from "vue";
import LoginCard from "./LoginCard.vue";
import RegisterCard from "./RegisterCard.vue";

const tab = ref("one");
const disableTabs = ref(false);

const loading = (value) => {
  if (value) {
    disableTabs.value = true;
  } else {
    disableTabs.value = false;
  }
};
</script>
