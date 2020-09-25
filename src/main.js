import { createApp } from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import store from './store'
import './database/firebase-app-script.js';
import './database/hs-firebase-utils';


createApp(App).use(store).use(router).mount('#app')
