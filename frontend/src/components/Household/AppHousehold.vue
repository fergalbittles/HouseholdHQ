<template>
  <div
    class="max-w-[500px] w-[90%] mt-7 mx-auto shadow-2xl rounded-lg border-solid border-2 border-black bg-white"
  >
    <v-tabs
      class="w-[100%] mx-auto rounded-t-lg"
      v-model="tab"
      bg-color="white"
      color="teal-darken-2"
      slider-color="teal-darken-2"
    >
      <v-tab :disabled="disableTabs" class="w-1/2" value="one">Create</v-tab>
      <v-tab :disabled="disableTabs" class="w-1/2" value="two">Join</v-tab>
    </v-tabs>

    <CreateHousehold v-if="tab == 'one'" @loading="loading" />
    <JoinHousehold v-else @loading="loading" />
  </div>
</template>

<script setup>
import { ref } from "vue";
import CreateHousehold from "./CreateHousehold.vue";
import JoinHousehold from "./JoinHousehold.vue";

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
