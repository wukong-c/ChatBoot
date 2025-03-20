import { defineStore } from "pinia";
export default defineStore("base", {
  state() {
    return {
      //有权限的菜单
      menus: [],
    };
  },
  actions: {
    setMenus(menu) {
      this.menus = menu;
    },
  },
  getters: {},
});
