import { createRouter, createWebHashHistory } from "vue-router";
export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: "/",
      name: "title",
      component: () => import("../views/TitleView.vue"),
    },
    {
      path: "/game",
      name: "game",
      component: () => import("../views/GameView.vue"),
    },
    {
      path: "/chapters",
      name: "chapters",
      component: () => import("../views/ChapterSelectView.vue"),
    },
    {
      path: "/collection",
      name: "collection",
      component: () => import("../views/CollectionView.vue"),
    },
    {
      path: "/saves",
      name: "saves",
      component: () => import("../views/SaveView.vue"),
    },
    {
      path: "/settings",
      name: "settings",
      component: () => import("../views/SettingsView.vue"),
    },
    { path: "/:pathMatch(.*)*", redirect: "/" },
  ],
});
