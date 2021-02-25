import Vue from "vue";
import VueRouter, { RouteConfig } from "vue-router";
import Overview from "@/views/Overview.vue";
import Login from "@/views/Login.vue";
import store from "@/store";
import AspectView from "@/views/AspectView.vue";
import { Aspects } from "@/data/data";

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
    path: "/grammar",
    name: "Grammar",
    component: AspectView,
    props: { aspect: Aspects.GRAMMAR }
  },
  {
    path: "/speaking",
    name: "Speaking",
    component: AspectView,
    props: { aspect: Aspects.SPEAKING }
  },
  {
    path: "/listening",
    name: "Listening",
    component: AspectView,
    props: { aspect: Aspects.LISTENING }
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
    path: "/profile",
    name: "Profile Settings",
    component: () => import("../views/Profile.vue")
  },
  {
    path: "/profile/avatar",
    name: "Change Avatar",
    component: () => import("../views/Avatar.vue")
  },
  {
    path: "/profile/password",
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
