import router from "@/router/index.js";
import store from "@/store";
import api from "@/api/login/index.js";
import { ElMessage } from "element-plus";

const Layout = () => import("@/layout/Layout.vue");
import home from "./routes/home.js";

//所有路由
const FullRoutes = [home];

//请求后端路由权限接口，与FullRoutes对比生成用户有权限的路由
export function generater() {
  return new Promise((resolve, reject) => {
    // api.getMenu().then(async res => {
    //   if (res.code == 200 && res.data) {
    //     if (res.data.length == 0) {
    //       ElMessage.warning("无访问权限");
    //       reject();
    //       return;
    //     }
    //     let permiTree = res.data[0]?.children || [];
    //     let permList = flattenTree(permiTree);
    //     let menus = getPermissionRoutes(permList);
    //     //插入路由
    //     router.addRoute(menus);
    //   }
    //   resolve();
    // });
    const { baseStore } = store();
    baseStore.setMenus(FullRoutes);
    let routes = {
      path: "/",
      name: "permisionRoutes",
      component: Layout,
      redirect: FullRoutes[0]?.path,
      children: FullRoutes,
    };
    router.addRoute(routes);
    resolve();
  });
}

//比对函数
function getPermissionRoutes(list) {
  const { baseStore } = store();
  let menuList = [];
  for (let i = 0; i < FullRoutes.length; i++) {
    let res = recusion(FullRoutes[i], list);
    if (res) {
      menuList.push(res);
    }
  }
  //保存至store，生成菜单
  baseStore.setMenus(menuList);
  //返回路由
  let routes = {
    path: "/",
    name: "permisionRoutes",
    component: Layout,
    redirect: menuList[0]?.path,
    children: menuList,
  };
  return routes;
}

function recusion(route, list) {
  route = {
    ...route,
  };
  if (route.children && route.children.length) {
    route._children = route.children;
    route.children = [];
    for (let i = 0; i < route._children.length; i++) {
      let chilRoute = route._children[i];
      let res = recusion(chilRoute, list);
      if (res) {
        route.children.push(res);
      }
    }
    if (route.children.length) {
      route.redirect = route.children[0].path;
      delete route._children;
      return route;
    }
  } else {
    let findRoute = list.find(i => i.path == route.path);
    if (findRoute) {
      route.buttonAuthMap = findRoute?.buttonAuthMap;
      return route;
    }
  }
}
function flattenTree(tree) {
  let result = [];
  tree.forEach(item => {
    if (item.children && item.children.length) {
      result = result.concat(flattenTree(item.children));
    } else {
      result.push(item);
    }
  });
  return result;
}
