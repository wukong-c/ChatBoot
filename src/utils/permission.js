import { ElMessageBox, ElMessage } from "element-plus";
import router from "@/router/index.js";
import baseStore from "@/store/base.store.js";
import useNavStore from "@/store/nav.store";
function getUrlParam(name, url) {
  if (!url) return null;
  let reg = new RegExp("[?&]" + name + "=([^&]*)(&|$)"); // 构造一个含有目标参数的正则表达式对象
  let r = url.match(reg); // 匹配目标参数
  if (r != null) {
    return [decodeURIComponent(r[1]), r[0]];
  }
  return [null]; // 返回参数值
}
export default {
  tokenKey: "token_XXXX",
  // 获取 token
  getToken() {
    let localToken = localStorage.getItem(this.tokenKey);
    if (localToken) {
      return localToken;
    }
    let href = location.href;
    let [token, tokenStr] = getUrlParam("token", href);
    if (token) {
      this.setToken(token);
      location.href = location.href.replace(tokenStr, "");
      return token;
    }
  },
  setToken(token) {
    localStorage.setItem(this.tokenKey, token);
  },
  removeToken() {
    localStorage.removeItem(this.tokenKey);
  },
  // 登录失效
  loseEfficacy() {
    ElMessage.warning("登录失效，请重新登录");
    this.removeToken();
    this.goLogin();
  },
  // 退出
  logout() {
    ElMessageBox.confirm("确定退出登录?", "退出", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
    })
      .then(() => {
        this.removeToken();
        this.goLogin();
      })
      .catch(() => {});
  },

  // 跳转登录
  goLogin() {
    this.removeToken();
    let currentRoute = router.currentRoute.value;
    let redirect = currentRoute.fullPath;
    redirect = encodeURIComponent(redirect);
    if (currentRoute.name == "login") {
      return;
    }
    //移除权限路由
    const store = baseStore();
    const navStore = useNavStore();
    store.setMenus([]);
    router.removeRoute("permisionRoutes");
    navStore.$reset();

    router.replace({ path: "/login", query: { redirect } });
  },
};
