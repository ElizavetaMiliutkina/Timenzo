import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from "@/router/index.js";
import { createPinia } from 'pinia';
import { Quasar } from 'quasar'
import 'quasar/src/css/index.sass'
import '@quasar/extras/material-icons/material-icons.css'

const app = createApp(App);
app.use(router);
app.use(Quasar, {
    plugins: {},
})
app.use(createPinia());
app.mount('#app');

