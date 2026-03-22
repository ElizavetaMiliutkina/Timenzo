import { createApp } from 'vue';
import './style.scss';
import '@/styles/custom-scrollbar.scss';
import App from './App.vue';
import router from '@/router/index.js';
import { createPinia } from 'pinia';
import { Quasar, Dark, Dialog } from 'quasar';
import 'quasar/src/css/index.sass';
import '@quasar/extras/material-icons/material-icons.css';

const app = createApp(App);

app.use(router);
app.use(createPinia());

app.use(Quasar, {
    plugins: { Dark, Dialog },
});

Dark.set(false);

app.mount('#app');
