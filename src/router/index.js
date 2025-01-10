import { createWebHistory, createRouter } from "vue-router";
import { useUserStore } from "@/store/useUserStore";

import mainPage from "@/views/mainPage.vue";
import tripPage from "@/views/tripPage.vue";
import shoesRecom from "@/views/shoesRecom.vue";
import shoesInfo from "@/views/shoesInfo.vue";
import loginPage from "@/views/loginPage.vue";

const routes = [
  {
    path: "/",
    name: "mainPage",
    component: mainPage,
    meta: { mainDivClass: "", auth: ["admin"] },
  },
  {
    path: "/map/:date",
    name: "tripPage",
    component: tripPage,
    meta: { mainDivClass: "", auth: ["admin"] },
  },
  {
    path: "/shoesRecom",
    name: "shoesRecom",
    component: shoesRecom,
    meta: { mainDivClass: "", auth: ["admin"] },
  },
  {
    path: "/:brand/:shoesName",
    name: "shoesInfo",
    component: shoesInfo,
    meta: { mainDivClass: "", auth: ["admin"] },
  },
  {
    path: "/login",
    name: "loginPage",
    component: loginPage,
    meta: { mainDivClass: "login-page-body", auth: [] },
  },
]; //라우팅 패스, 컴포넌트 등 정의

export const router = createRouter({
  scrollBehavior() {
    return { top: 0 };
  },
  history: createWebHistory(),
  routes: routes,
});

router.beforeEach((to, from, next) => {
  if (to.fullPath === "/login") {
    next();
  }

  const userStore = useUserStore();

  if (!userStore.token) {
    next({ path: "/login" });
  }

  const { auth } = to.meta;

  if (auth.length && !auth.filter((v) => !userStore.userInfo.roleList.includes(v))) {
    next({ path: "/login" });
  }
  next();
});
