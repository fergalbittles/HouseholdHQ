import { createApp } from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import { loadFonts } from './plugins/webfontloader'
import './assets/tailwind.css'
import axios from 'axios'
import VueAxios from 'vue-axios'
import router from "./router/index"

loadFonts()

createApp(App)
  .use(vuetify)
  .use(VueAxios, axios)
  .use(router)
  .mount('#app')
