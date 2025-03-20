<template>
  <template v-if="!itemData.children">
    <el-menu-item v-if="!itemData.meta.hideMenu" :index="itemData.path" @click="jumpRouter(itemData.path)">
      <el-icon v-if="itemData.meta.icon && root">
        <svgIcon :name="itemData.meta.icon"></svgIcon>
      </el-icon>
      <template #title>
        <div class="subMenu">
          <span>{{ itemData.meta.title }}</span>
        </div>
      </template>
    </el-menu-item>
  </template>
  <el-sub-menu v-else :index="item.path">
    <template #title>
      <el-icon v-if="itemData.meta.icon">
        <svgIcon :name="itemData.meta.icon"></svgIcon>
      </el-icon>
      <span>{{ itemData.meta.title }}</span>
    </template>
    <SideMenuItem v-for="(item1, index) in item.children" :key="index" :item="item1"></SideMenuItem>
  </el-sub-menu>
</template>
<script setup name="SideMenuItem">
import { ElSubMenu, ElMenuItem } from "element-plus";
const props = defineProps({
  item: {
    type: Object,
    default: () => ({}),
  },
  //第一层才显示图标
  root: {
    type: Boolean,
    default: false,
  },
});
const itemData = reactive(props.item);
const router = useRouter();
// 路由跳转
function jumpRouter(item) {
  router.push({
    path: item,
  });
}
</script>
<style lang="scss" scoped>
.iconSvg {
  margin-right: 8px;
}
.el-sub-menu {
  .subMenu {
    position: relative;
    right: 8px;
  }
}
</style>
<style lang="scss">
.el-sub-menu {
  .el-menu-item {
    margin: 8px;
  }
}
.el-menu-item {
  border-radius: 6px;
  overflow: hidden;
  margin-top: 8px;
  margin-bottom: 8px;
  &.is-active {
    background-color: #1569da;
    color: #fff !important;
  }
}

.el-sub-menu {
  margin-bottom: 8px;
  &.is-active {
    > .el-sub-menu__title {
      color: #fff;
      background: linear-gradient(270deg, rgba(47, 162, 239, 0.13) 0%, rgba(21, 105, 218, 0.6) 100%);
    }
  }
}
</style>
