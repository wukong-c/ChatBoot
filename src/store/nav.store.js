import { defineStore } from "pinia";
import { toRaw, unref } from "vue";
export default defineStore("nav", {
  state() {
    return {
      tabList: [],
    };
  },
  actions: {
    addTab(route) {
      const { path, name, fullPath, params, query, meta } = route;
      if (name == "404") return;
      let updateIndex = -1;
      const tabHasExits = this.tabList.some((tab, index) => {
        updateIndex = index;
        return tab.path === path;
      });
      //已存在更新
      if (tabHasExits) {
        const curTab = toRaw(this.tabList)[updateIndex];
        if (!curTab) {
          return;
        }
        curTab.params = params;
        curTab.query = query;
        curTab.fullPath = fullPath;
        this.tabList.splice(updateIndex, 1, curTab);
      } else {
        if (this.tabList.length >= 10) {
          this.tabList.splice(1, this.tabList.length - 9);
        }
        if (route.meta.affix) {
          this.tabList.unshift(route);
        } else {
          this.tabList.push(route);
        }
      }
    },
    closeTab(tab, router) {
      const close = route => {
        const { fullPath, meta } = route;
        if (meta.affix) {
          return;
        }
        const index = this.tabList.findIndex(item => item.fullPath === fullPath);
        index !== -1 && this.tabList.splice(index, 1);
      };
      if (this.tabList.length <= 1) return;
      const { currentRoute, replace } = router;
      const { path } = unref(currentRoute);
      //不是活动标签
      if (path !== tab.path) {
        close(tab);
      } else {
        //当前index
        const index = this.tabList.findIndex(item => item.path === path);
        const page = this.tabList[index - 1];
        let toTarget = getToTarget(page);
        close(currentRoute.value);
        //跳到上一个
        replace(toTarget);
      }
    },
  },
});

//格式化route参数
function getToTarget(tabItem) {
  const { params, path, query } = tabItem;
  return {
    params: params || {},
    path,
    query: query || {},
  };
}

function isEmpty(obj) {
  return Object.keys(obj).length == 0;
}
