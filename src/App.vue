<template>
  <el-config-provider size="default" :z-index="3000" :locale="zhCn">
    <router-view></router-view>
  </el-config-provider>
</template>
s
<script setup>
import { ElConfigProvider } from "element-plus";
import zhCn from "element-plus/dist/locale/zh-cn.mjs";
import permission from "./utils/permission";
//判断token
if (!permission.getToken()) {
  permission.goLogin();
}
</script>
<style lang="scss"></style>
