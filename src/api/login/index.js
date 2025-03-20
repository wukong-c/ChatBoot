import $axios from "@/plugins/axios";

export default {
  // 登录获取令牌
  login: params => {
    return $axios({
      method: "post",
      url: "/api/v1/auth/login/access-token",
      data: params,
      headers: {
        isToken: false,
        "Content-Type": "application/x-www-form-urlencoded"
      },
    });
  },
  
  // 注册新用户
  register: params => {
    return $axios({
      method: "post",
      url: "/api/v1/auth/register",
      data: params,
      headers: {
        isToken: false,
      },
    });
  },
  
  // 获取当前用户信息
  getUserInfo: () => {
    return $axios({
      method: "get",
      url: "/api/v1/auth/me",
      isSourceData: true,
    });
  },
  
  // 获取所有聊天会话
  getChatSessions: () => {
    return $axios({
      method: "get",
      url: "/api/v1/chat/sessions",
      isSourceData: true,
    });
  },

  //获取验证码
  captchaImage: () => {
    return $axios({
      url: "/prod-api-app/code",
      method: "get",
      timeout: 20000,
      isSourceData: true,
      noToken: true,
    });
  },

  //获取权限菜单
  getMenu() {
    return $axios({
      url: "/prod-api-app/thirdApp/getMenuData?systemId=XXX",
      method: "get",
      isSourceData: true,
    });
  },
};
