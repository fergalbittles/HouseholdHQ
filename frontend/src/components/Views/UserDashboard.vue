<template>
  <div>
    <div class="flex w-[90%] mx-auto mt-7">
      <v-avatar size="100px" class="mr-5 block font-medium shadow-xl">
        <v-img
          alt="Avatar"
          :src="
            user?.profilePhoto > -1
              ? 'https://xsgames.co/randomusers/assets/avatars/pixel/' +
                user?.profilePhoto +
                '.jpg'
              : require('../../assets/avatar.jpeg')
          "
        ></v-img>
      </v-avatar>
      <div class="mt-auto">
        <h1 id="page_heading" class="text-white text-h4 block font-medium">
          {{ user?.name }}
        </h1>
        <p class="text-white font-light">Customise your profile from this page</p>
      </div>
    </div>

    <v-card
      title="Profile Photo"
      subtitle="Select a profile photo"
      class="w-[90%] mx-auto mt-8 rounded-lg !shadow-2xl mb-20 !bg-gradient-to-r !from-green-500 !to-green-800 text-white"
    >
      <div
        v-for="i in 53"
        :key="i"
        @click="profilePhotoUpdate(i)"
        class="w-fit mx-5 mb-5 float-left hover:cursor-pointer shadow-lg"
        :class="{ 'hover:cursor-not-allowed': loading }"
      >
        <v-img
          class="h-[100px] w-[100px] rounded-lg"
          :src="'https://xsgames.co/randomusers/assets/avatars/pixel/' + i + '.jpg'"
        >
        </v-img>
      </div>
      <div
        @click="profilePhotoUpdate(-1)"
        class="w-fit mx-5 mb-5 float-left hover:cursor-pointer shadow-lg"
        :class="{ 'hover:cursor-not-allowed': loading }"
      >
        <v-img
          class="h-[100px] w-[100px] rounded-lg"
          :src="require('../../assets/avatar.jpeg')"
        >
        </v-img>
      </div>
    </v-card>
  </div>
</template>

<script setup>
import { user, updateProfilePhoto, loading } from "../../util/userInfo";

function profilePhotoUpdate(profilePhoto) {
  if (loading.value) {
    return;
  }

  updateProfilePhoto(profilePhoto);

  const audio = new Audio(require("../../assets/button_sound.mp3"));
  audio.play();
}
</script>
