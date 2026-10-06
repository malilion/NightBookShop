import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import { router } from "./router";
import "./styles/main.css";
import "./styles/minigames.css";
import "./styles/scenes.css";
createApp(App).use(createPinia()).use(router).mount("#app");
