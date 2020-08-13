import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);
const routes = [
  {
    path: "/",
    name: "Home",
    component: () => import(/* webpackChunkName: "vue-home" */ "../views/Home.vue"),
  },
  {
    path: "/about",
    name: "About",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "vue-about" */ "../views/About.vue"),
  },
];
const router = new VueRouter({
  mode: "history",
  // 设置路由加载的根路径
  base: "/vue",
  routes,
});
export default router;
