import { createApp } from "vue";
import { createPinia } from "pinia";
import { createRouter, createWebHashHistory } from "vue-router";
import TeaApp from "./TeaApp.vue";
import "./styles/main.css";
// Standalone entry: the tea house alone, without the story engine or chapters.
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: "/:pathMatch(.*)*",
      name: "tea",
      component: () => import("./views/TeaHouseView.vue"),
      props: { standalone: true },
    },
  ],
});
createApp(TeaApp).use(createPinia()).use(router).mount("#app");
