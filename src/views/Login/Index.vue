<template>
  <div class="main">
    <div class="login_box">
      <div class="left_input">
        <div class="tab-container">
          <div 
            class="tab-item" 
            :class="{ active: activeTab === 'login' }" 
            @click="switchTab('login')"
          >
            登录
          </div>
          <div 
            class="tab-item" 
            :class="{ active: activeTab === 'register' }" 
            @click="switchTab('register')"
          >
            注册
          </div>
        </div>
        
        <!-- 登录表单 -->
        <el-form v-if="activeTab === 'login'" ref="loginFormRef" :model="loginForm" :rules="loginRules">
          <el-form-item prop="username">
            <el-input
              v-model="loginForm.username"
              auto-complete="off"
              prefix-icon="User"
              placeholder="请输入账号"
              @keyup.enter="login"
            >
            </el-input>
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              auto-complete="off"
              prefix-icon="Lock"
              show-password
              @keyup.enter="login"
            ></el-input>
          </el-form-item>
          <el-form-item>
            <div v-loading="loginLoading" class="login_btn" @click="login">
              <span v-if="!loginLoading">登 录</span>
              <span v-else>登 录 中...</span>
            </div>
          </el-form-item>
        </el-form>
        
        <!-- 注册表单 -->
        <el-form v-if="activeTab === 'register'" ref="registerFormRef" :model="registerForm" :rules="registerRules">
          <el-form-item prop="username">
            <el-input
              v-model="registerForm.username"
              auto-complete="off"
              prefix-icon="User"
              placeholder="请输入用户名"
            >
            </el-input>
          </el-form-item>
          <el-form-item prop="email">
            <el-input
              v-model="registerForm.email"
              auto-complete="off"
              prefix-icon="Message"
              placeholder="请输入邮箱"
            >
            </el-input>
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              v-model="registerForm.password"
              type="password"
              placeholder="请输入密码"
              auto-complete="off"
              prefix-icon="Lock"
              show-password
            ></el-input>
          </el-form-item>
          <el-form-item prop="confirmPassword">
            <el-input
              v-model="registerForm.confirmPassword"
              type="password"
              placeholder="请确认密码"
              auto-complete="off"
              prefix-icon="Lock"
              show-password
            ></el-input>
          </el-form-item>
          <el-form-item>
            <div v-loading="registerLoading" class="login_btn" @click="register">
              <span v-if="!registerLoading">注 册</span>
              <span v-else>注 册 中...</span>
            </div>
          </el-form-item>
        </el-form>
      </div>
    </div>
    <footer>
      <img src="@/assets/images/logo_b.png" alt="logo" />
      <p>技术支持：北京首创大气环境科技股份有限公司</p>
    </footer>
  </div>
</template>

<script setup>
import { ElMessage } from "element-plus";
import permission from "@/utils/permission";
import api from "@/api/login/index.js";

const title = import.meta.env.VITE_TITLE;
const router = useRouter();

// 标签切换
const activeTab = ref('login');
const switchTab = (tab) => {
  activeTab.value = tab;
};

// 登录相关
const loginFormRef = ref(null);
const loginForm = reactive({ username: "", password: "" });
const loginLoading = ref(false);
const loginRules = {
  username: { required: true, message: "请输入账号", trigger: "blur" },
  password: { required: true, message: "请输入密码", trigger: "blur" },
};

// 注册相关
const registerFormRef = ref(null);
const registerForm = reactive({ 
  username: "", 
  email: "", 
  password: "",
  confirmPassword: ""
});
const registerLoading = ref(false);
const registerRules = {
  username: { required: true, message: "请输入用户名", trigger: "blur" },
  email: [
    { required: true, message: "请输入邮箱", trigger: "blur" },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
  ],
  password: { required: true, message: "请输入密码", trigger: "blur" },
  confirmPassword: [
    { required: true, message: "请确认密码", trigger: "blur" },
    { 
      validator: (rule, value, callback) => {
        if (value !== registerForm.password) {
          callback(new Error('两次输入密码不一致'));
        } else {
          callback();
        }
      }, 
      trigger: 'blur' 
    }
  ]
};

// 登录方法
function login() {
  loginFormRef.value.validate(valid => {
    if (valid) {
      loginLoading.value = true;
      api.login(loginForm)
        .then(res => {
          if (res && res.access_token) {
            let token = res.access_token;
            permission.setToken(token);
            getUserInfo();
            ElMessage.success('登录成功');
          } else {
            ElMessage.error(res.message || '登录失败');
          }
        })
        .catch(err => {
          ElMessage.error(err.message || '登录失败');
        })
        .finally(() => {
          loginLoading.value = false;
        });
    }
  });
}

// 注册方法
function register() {
  registerFormRef.value.validate(valid => {
    if (valid) {
      // 删除确认密码字段，不需要提交给后端
      const registerData = {
        username: registerForm.username,
        email: registerForm.email,
        password: registerForm.password
      };
      
      registerLoading.value = true;
      api.register(registerData)
        .then(res => {
          if (res) {
            ElMessage.success('注册成功，请登录');
            // 切换到登录页
            activeTab.value = 'login';
            // 预填充用户名
            loginForm.username = registerForm.username;
            // 清空注册表单
            registerForm.password = '';
            registerForm.confirmPassword = '';
          } else {
            ElMessage.error(res.message || '注册失败');
          }
        })
        .catch(err => {
          ElMessage.error(err.message || '注册失败');
        })
        .finally(() => {
          registerLoading.value = false;
        });
    }
  });
}

// 获取用户信息
async function getUserInfo() {
  try {
    const userInfo = await api.getUserInfo();
    if (userInfo) {
      localStorage.setItem("locaUserInfo", JSON.stringify(userInfo));
      router.replace("/");
    }
  } catch (error) {
    ElMessage.error('获取用户信息失败');
    permission.removeToken();
  }
}
</script>

<style lang="scss" scoped>
:deep(.el-input__wrapper) {
  height: 46px;
  border: 1px solid #bfbfbf;
  box-shadow: none !important;
  background: transparent;
  border-radius: 2px;
  .el-input__inner {
    height: 100%;
    padding-left: 10px;
    &::-webkit-input-placeholder {
      /* WebKit browsers，webkit内核浏览器 */
      font-size: 12px;
    }
  }
}
:deep(.el-form-item--default) {
  margin-bottom: 24px;
}
:deep(.el-input__icon) {
  font-size: 20px;
}
.main {
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: url("@/assets/images/login/login_bg_back.png") no-repeat;
  background-size: cover;
  // 外盒子
  .login_box {
    width: 1121px;
    height: 554px;
    display: flex;
    justify-content: flex-end;
    border-radius: 10px;
    background: url("@/assets/images/login/login_back.png") no-repeat;
    background-size: contain;
  }
  // 左侧 表单
  .left_input {
    width: 43%;
    height: 100%;
    padding: 90px 57px;
    background: rgba(255, 255, 255, 0.9);
    border-top-right-radius: 10px;
    border-bottom-right-radius: 10px;
    overflow: hidden;
    
    .tab-container {
      display: flex;
      margin-bottom: 40px;
      
      .tab-item {
        flex: 1;
        text-align: center;
        font-size: 18px;
        padding: 10px 0;
        cursor: pointer;
        color: #666;
        transition: all 0.3s;
        border-bottom: 2px solid transparent;
        
        &.active {
          color: #0481dc;
          border-bottom: 2px solid #0481dc;
          font-weight: bold;
        }
        
        &:hover {
          color: #0481dc;
        }
      }
    }
  }
  // 表单内容
  .el-form {
    background: transparent !important;
  }
  .login_btn {
    margin-top: 20px;
    width: 100%;
    height: 45px;
    font-size: 16px;
    text-align: center;
    line-height: 45px;
    background: $TC;
    border-radius: 2px;
    transition: transform 0.3s;
    color: #fff;
    cursor: pointer;
    &:hover {
      transform: scale(1.1);
    }
  }
  footer {
    text-align: center;
    position: absolute;
    bottom: 30px;
    width: 100%;
    img {
      width: 270px;
    }
    p {
      margin-top: 5px;
      font-size: 14px;
      color: #ccc;
    }
  }
}
</style>
