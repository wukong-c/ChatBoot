import { createRouter, createWebHashHistory } from "vue-router";
import { initGuard } from "./guard.js";
import Error404 from "../components/errorComponent/404.vue";
import Login from "@/views/Login/Index.vue";

let routes = [
  {
    path: "/login",
    name: "login",
    component: Login,
  },
  {
    path: "/:path(.*)*",
    name: "404",
    component: Error404,
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});
//路由守卫
initGuard(router);

export default router;
