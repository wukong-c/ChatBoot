<template>
  <div id="layout">
    <Head v-if="!isFullScreen">
      <img src="@/assets/images/layout/title-logo.png" alt="" />
      <span class="text">{{ title }}</span>
    </Head>
    <div class="main">
      <SideMenu v-if="!isFullScreen" :collapse="isCollapse" :menus="Menus"></SideMenu>
      <div class="routeBox">
        <div v-if="!isFullScreen" class="nvBarBox">
          <img class="collspBtn" :src="isCollapse ? OpenImg : CloseImg" @click="isCollapse = !isCollapse" />
          <navBar></navBar>
        </div>
        <router-view v-slot="{ Component }">
          <div class="container" :class="{ full: isFullScreen }">
            <component :is="Component" :key="$route.path" />
          </div>
        </router-view>
      </div>
    </div>
  </div>
</template>

<script setup>
import Head from "./components/Head.vue";
import SideMenu from "./components/SideMenu.vue";
import navBar from "@/components/navBar/index.vue";

import CloseImg from "@/assets/images/layout/close.png";
import OpenImg from "@/assets/images/layout/open.png";
const route = useRoute();

const title = import.meta.env.VITE_TITLE;
const isCollapse = ref(false);

import store from "@/store";
const { baseStore } = store();
//菜单
const Menus = computed(() => {
  return baseStore.menus;
});

//是否全屏
const isFullScreen = computed(() => {
  return route.meta.fullScreen;
});
</script>

<style scoped lang="scss">
#layout {
  height: 100%;
  width: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background-color: #f4f5f8;
  .main {
    flex: 1;
    overflow: auto;
    display: flex;
    .routeBox {
      flex: 1;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      .nvBarBox {
        display: flex;
        margin: 8px 0;
        padding: 0 16px;
        align-items: center;
        .collspBtn {
          height: 16px;
          width: 18px;
          margin-right: 6px;
          cursor: pointer;
        }
      }
      .container {
        display: flex;
        flex-direction: column;
        padding: 0 16px 16px;
        height: 100%;
        overflow: hidden;
        flex: 1;
        &.full {
          padding: 0;
          display: block;
        }
      }
    }
  }
}
</style>
