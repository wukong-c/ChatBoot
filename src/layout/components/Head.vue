<template>
  <el-header class="page_title">
    <h1>
      <slot></slot>
    </h1>
    <div class="right">
      <div class="landing">
        <span>{{ userName }}</span>
        <span class="split">|</span>
        <span class="cup" @click="onLogout">退出</span>
      </div>
    </div>
  </el-header>
</template>

<script setup>
import permission from "@/utils/permission";
//用户名
const userName = computed(() => {
  return JSON.parse(localStorage.getItem("locaUserInfo"))?.userName || "未知";
});
//退出
function onLogout() {
  permission.logout();
}
</script>

<style lang="scss" scoped>
.page_title {
  width: 100%;
  height: 64px;
  line-height: 64px;
  background: url("@/assets/images/layout/header-bg.png");
  background-size: cover;
  font-family: MicrosoftYaHei;
  display: flex;
  justify-content: space-between;
  // 标题
  h1 {
    display: flex;
    align-items: center;
    font-size: 24px;
    font-weight: bold;
    color: #007eff;
    letter-spacing: 1px;
    text-shadow: 0px 4px 6px rgba(0, 70, 164, 0.34);
    :deep(img) {
      width: 49px;
      height: 52px;
      margin-right: 15px;
    }
  }
  .right {
    display: flex;
    .menus {
      margin-right: 50px;
      .aMenu {
        float: left;
        margin: 0 10px;
        font-size: 18px;
        color: #333333;
        padding: 0 10px;
        position: relative;
        font-weight: 500;
      }
      .active .aMenu {
        color: $TC;
        font-weight: 600;
        &::after {
          position: absolute;
          content: "";
          height: 3px;
          width: 36px;
          background: #0061e2;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
        }
      }
    }
  }
  .el-menu-top {
    background-color: transparent;
    border-bottom: none;
    .el-menu-item {
      font-size: 18px;
    }
  }

  // 信息
  .landing {
    display: flex;
    font-size: 14px;
    color: #666666;
    justify-content: space-around;
    .cup {
      cursor: pointer;
      &:hover {
        color: $TC;
      }
    }
    .split {
      padding: 0 8px;
    }
  }
}
</style>
