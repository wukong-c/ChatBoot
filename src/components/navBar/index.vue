<template>
  <div class="navBar">
    <el-tag
      v-for="tag in tabList"
      :key="tag.path"
      class="navtag"
      :class="{ active: currentRoute.path == tag.path }"
      :closable="!tag.meta.affix"
      :effect="currentRoute.path == tag.path ? 'dark' : 'plain'"
      @click="goto(tag)"
      @close="handleClose(tag)"
      @contextmenu.prevent="handleCtxMenu($event, tag)"
    >
      {{ tag.meta.title }}
    </el-tag>
  </div>
  <contextMenu
    ref="ctxMenuRef"
    v-bind="$attrs"
    @refresh="refresh"
    @close-current="closeCurrent"
    @close-other="closeOther"
    @close-left="closeLeft"
    @close-right="closeRight"
    @close-all="closeAll"
  ></contextMenu>
</template>
<script setup name="NavBar">
import { ref, computed, toRaw } from "vue";
import { useRouter } from "vue-router";
import useAffixTabs from "./hook/useAffixTabs.js";
import useNavStore from "@/store/nav.store";

import contextMenu from "./contextMenu.vue";
const ctxMenuRef = ref(null);

const navStore = useNavStore();
const router = useRouter();
const { currentRoute, push } = router;
useAffixTabs();

const tabList = computed(() => navStore.tabList);

function handleClose(tab) {
  navStore.closeTab(tab, router);
}
function goto(route) {
  push(route);
}
function handleCtxMenu(event, data) {
  const { x, y } = event;
  ctxMenuRef.value.show(x, y, toRaw(data));
  ctxMenuRef.value.setBtnsShow();
}

// 刷新
function refresh() {
  location.reload();
}
// 关闭当前
function closeCurrent(nodeobj) {
  if (nodeobj.name !== "/dataMent/index") {
    navStore.closeTab(nodeobj, router);
  }
}
// 关闭其他
function closeOther(nodeobj) {
  navStore.closeOther(nodeobj, router);
}
// 关闭左侧
function closeLeft(nodeobj) {
  navStore.closeLeft(nodeobj, router);
}
// 关闭右侧
function closeRight(nodeobj) {
  navStore.closeRight(nodeobj, router);
}
// 全部关闭
function closeAll() {
  navStore.closeAll(router);
}
</script>
<style scoped lang="scss">
.navBar {
  height: 28px;
  text-align: left;
  white-space: nowrap;
  overflow-x: overlay;
  overflow-y: hidden;
  flex: 1;
  .navtag {
    height: 26px;
    line-height: 26px;
    font-size: 14px;
    border: 0;
    border-radius: 2px;
    cursor: pointer;
    margin-right: 4px;
    color: #333;
    &.active {
      color: #fff;
    }
  }
}
</style>
