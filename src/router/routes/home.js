const Home = () => import("@/views/Home/Index.vue");
export default {
  name: "Home",
  path: "/home",
  component: Home,
  meta: {
    title: "首页",
    icon: "data",
  },
};
