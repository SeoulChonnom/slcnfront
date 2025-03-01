import { createApp } from 'vue';
import App from './App.vue';
import { createPinia } from 'pinia';
import { router } from './router';

const myApp = createApp(App);
myApp.use(router);
myApp.use(createPinia());
myApp.mount('#app');
