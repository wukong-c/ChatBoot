<template>
  <div v-if="menus.length" class="sideMenu">
    <el-menu router unique-opened :default-active="nowActive" v-bind="$attrs">
      <template v-for="item in menus" :key="item.path">
        <SideMenuItem v-if="!item.meta.hideMenu" :item="item" :root="true"></SideMenuItem>
      </template>
    </el-menu>
  </div>
</template>

<script setup>
import { ElMenu } from "element-plus";
import SideMenuItem from "./SideMenuItem.vue";
defineProps({
  menus: {
    required: true,
    type: Array,
  },
});

const route = useRoute();
const nowActive = computed(() => {
  return route.meta.activeMenu || route.path;
});
</script>

<style lang="scss" scoped>
.sideMenu {
  background-color: #2b323e;
  font-weight: 500;
  overflow-y: auto;
  --el-menu-item-height: 42px;
  --el-menu-sub-item-height: 40px;
  --el-menu-bg-color: #2b323e;
  --el-menu-text-color: #f1f1f1;
  --el-menu-level-padding: 18px;
  --el-menu-base-level-padding: 18px;
  :deep(.el-menu) {
    border: 0;
    --el-menu-hover-bg-color: rgba(7, 103, 241, 0.1) !important;
    &:not(.el-menu--collapse) {
      width: 200px;
    }
  }
}
</style>
