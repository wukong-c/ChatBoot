import axios from "axios";
import { ElMessage } from "element-plus";
import permission from "../utils/permission";
import qs from 'qs';

const $axios = axios.create({
  baseURL: import.meta.env.VITE_AXIOS_BASEURL || 'http://localhost:8000',
  timeout: 300000,
});
/*
  **********************************************
  所有的接口都统一写在  src/api文件夹下面 *********
  **********************************************
*/

// 请求拦截
$axios.interceptors.request.use(config => {
  // 处理表单数据
  if (config.headers["Content-Type"] === "application/x-www-form-urlencoded") {
    config.data = qs.stringify(config.data);
  }
  
  if (config.url !== "/api/v1/auth/login/access-token" && config.url !== "/api/v1/auth/register") {
    let token = permission.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// 响应拦截
$axios.interceptors.response.use(
  response => {
    let resData = response.data;
    let { isSourceData } = response.config;
    
    //退出登录前置
    if (response.status === 401 || response.status === 403) {
      permission.loseEfficacy();
      return Promise.reject(new Error('认证失败，请重新登录'));
    }
    
    //返回原始数据
    if (isSourceData) {
      return resData;
    }

    // 下载文件流
    if (Object.prototype.toString.call(resData) === "[object Blob]" && resData.size > 89) {
      let fileName = "导出文件.xlsx";
      let contentType = "application/vnd.ms-excel";
      if (response.headers["content-disposition"]) {
        fileName = decodeURIComponent(response.headers["content-disposition"]).replace(
          "attachment;filename*=utf-8''",
          ""
        );
      }
      if (response.headers["content-type"]) {
        contentType = response.headers["content-type"];
      }
      const link = document.createElement("a");
      const blob = new Blob([resData], {
        type: contentType,
      });
      link.style.display = "none";
      link.href = URL.createObjectURL(blob);
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      ElMessage.success("导出成功");
      return;
    }
    
    return resData;
  },
  error => {
    // 处理错误
    if (error.response) {
      const status = error.response.status;
      
      if (status === 401 || status === 403) {
        //退出登录
        permission.loseEfficacy();
        return Promise.reject(error);
      }

      // 获取错误信息
      let errMsg = error.response.data?.detail || error.response.data?.message || '请求失败';
      
      ElMessage({
        message: errMsg,
        type: "error",
        duration: 3000,
      });
    } else {
      ElMessage({
        message: error.message || "网络错误",
        type: "error",
        duration: 3000,
      });
    }
    
    return Promise.reject(error);
  }
);

export default $axios;
