import store from "@/store";
import { generater } from "./generater";

export function initGuard(router) {
  router.beforeEach(async (to, from, next) => {
    if (to.path === "/login") {
      next();
      return;
    }
    const { baseStore, navStore } = store();
    if (!baseStore.menus.length) {
      await generater();
      //如果有链接token 删掉
      let [token, tokenStr] = getUrlParam("token", to.fullPath);
      if (token) {
        to.fullPath = to.fullPath.replace(tokenStr, "");
      }
      navStore.addTab(to);
      next(to.fullPath);
    } else {
      navStore.addTab(to);
      next();
    }
  });
}

function getUrlParam(name, url) {
  if (!url) return null;
  let reg = new RegExp("[?&]" + name + "=([^&]*)(&|$)"); // 构造一个含有目标参数的正则表达式对象
  let r = url.match(reg); // 匹配目标参数
  if (r != null) {
    return [decodeURIComponent(r[1]), r[0]];
  }
  return [null]; // 返回参数值
}
