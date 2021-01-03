import Vue from "vue";
import VueRouter, { RouteConfig } from "vue-router";
import Overview from "../views/Overview.vue";
import Curriculum from "@/views/Curriculum.vue";
import Materials from "@/views/Materials.vue";
import Login from "@/views/Login.vue";
import store from "@/store";

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  {
    path: "/login",
    name: "Login",
    component: Login
  },
  {
    path: "/",
    name: "Overview",
    component: Overview
  },
  {
    path: "/curriculum",
    name: "Curriculum",
    component: Curriculum
  },
  {
    path: "/materials",
    name: "Materials",
    component: Materials
  },
  {
    path: "/monspeaking",
    name: "Monthly Speaking",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "speaking" */ "../views/MonSpeaking.vue")
  },
  {
    path: "/hall-of-fame",
    name: "Hall of Fame",
    component: () => import("../views/HallOfFame.vue")
  },
  {
    path: "/rol",
    name: "Read Out Loud",
    component: () => import("../views/ReadOutLoud.vue")
  },
  {
    path: "/tol",
    name: "Think Out Loud",
    component: () => import("../views/ThinkOutLoud.vue")
  },
  {
    path: "/profile",
    name: "Profile Settings",
    component: () => import("../views/Profile.vue")
  },
  {
    path: "/avatar",
    name: "Change Avatar",
    component: () => import("../views/Avatar.vue")
  },
  {
    path: "/password",
    name: "Change Password",
    component: () => import("../views/Password.vue")
  },
  {
    path: "/hhw",
    name: "Holidays Homework",
    component: () => import("../views/HolidayHomework.vue")
  }
];

const router = new VueRouter({
  routes
});

store.watch(
  () => {
    return store.getters.isLogged;
  },
  (oldValue, newValue) => {
    if (oldValue == newValue) return;
    if (newValue) router.push("/login");
    else router.push("/");
  }
);

router.beforeEach((to, from, next) => {
  //if (to.path == from.path) return;
  to.matched.some(record => {
    if (record.path == "/login") {
      if (store.getters.isLogged) next("/");
      else next();
    } else if (!store.getters.isLogged) next("/login");
    else next();
  });
});

export default router;
