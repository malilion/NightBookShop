import { createRouter, createWebHashHistory } from "vue-router";
// Title and game are loaded with the app shell so a mid-story reload does not
// depend on a second dynamic import (CI has seen that fetch abort and leave an
// empty RouterView: only the skip link, no letter panel).
import TitleView from "../views/TitleView.vue";
import GameView from "../views/GameView.vue";

export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: "/",
      name: "title",
      component: TitleView,
    },
    {
      path: "/game",
      name: "game",
      component: GameView,
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
      path: "/tea",
      name: "tea",
      component: () => import("../views/TeaHouseView.vue"),
    },
    {
      path: "/settings",
      name: "settings",
      component: () => import("../views/SettingsView.vue"),
    },
    {
      path: "/about",
      name: "about",
      component: () => import("../views/AboutView.vue"),
    },
    { path: "/:pathMatch(.*)*", redirect: "/" },
  ],
});
