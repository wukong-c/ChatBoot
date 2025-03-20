<template>
  <ul v-show="isShow" class="contextMenu" :style="{ top: position.top + 'px', left: position.left + 'px' }">
    <li class="aRow" @click="refresh"><Refresh class="icon" />刷新页面</li>
    <li v-if="showCloseCurrent" class="aRow" @click="closeCurrent"><Close class="icon" />关闭当前</li>
    <li v-if="showCloseOther" class="aRow" @click="closeOther"><CircleClose class="icon" />关闭其他</li>
    <li v-if="showCloseLeft" class="aRow" @click="closeLeft"><Back class="icon" />关闭左侧</li>
    <li v-if="showCloseRight" class="aRow" @click="closeRight"><Right class="icon" />关闭右侧</li>
    <li class="aRow" @click="closeAll"><CircleClose class="icon" />全部关闭</li>
  </ul>
</template>
<script setup>
import { ref, unref, shallowRef, reactive, watch } from "vue";
import useNavStore from "@/store/nav.store";
const navStore = useNavStore();
// 关闭当前标识
const showCloseCurrent = ref(true);
// 关闭其他标识
const showCloseOther = ref(true);
// 关闭左侧标识
const showCloseLeft = ref(true);
// 关闭右侧标识
const showCloseRight = ref(true);
const emits = defineEmits(["refresh", "closeCurrent", "closeOther", "closeLeft", "closeRight", "closeAll"]);
const isShow = ref(false);
const position = reactive({
  top: 0,
  left: 0,
});
let target = shallowRef(null);

watch(
  () => target.value,
  () => {
    setBtnsShow();
  }
);
watch(
  () => navStore.tabList,
  () => {
    setBtnsShow();
  }
);
function show(left, top, _target) {
  position.top = top;
  position.left = left;
  isShow.value = true;
  target.value = _target;
  document.addEventListener("click", htmlClickFun);
}
function htmlClickFun() {
  isShow.value = false;
  document.removeEventListener("click", htmlClickFun);
}

function setBtnsShow() {
  showCloseCurrent.value = true;
  showCloseOther.value = true;
  showCloseLeft.value = true;
  showCloseRight.value = true;
  // 当前位置
  const index = navStore.tabList.findIndex(item => item.path === target.value.path);
  // 位置为第一个
  if (index == 0) {
    // 隐藏关闭左侧
    showCloseLeft.value = false;
  }
  // 位置为最后一个
  if (index == navStore.tabList.length - 1) {
    // 隐藏关闭右侧
    showCloseRight.value = false;
  }
  // 仅有一个
  if (navStore.tabList.length == 1) {
    // 隐藏关闭其他
    showCloseOther.value = false;
  }
}

// 刷新
function refresh() {
  emits("refresh", unref(target));
}
// 关闭当前
function closeCurrent() {
  emits("closeCurrent", unref(target));
}
// 关闭其他
function closeOther() {
  emits("closeOther", unref(target));
}
// 关闭左侧
function closeLeft() {
  emits("closeLeft", unref(target));
}
// 关闭右侧
function closeRight() {
  emits("closeRight", unref(target));
}
// 全部关闭
function closeAll() {
  emits("closeAll", unref(target));
}

defineExpose({ show, setBtnsShow });
</script>
<style lang="scss" scoped>
.contextMenu {
  width: 100px;
  background-color: #fff;
  box-shadow: 0 0 10px #ddd;
  position: fixed;
  z-index: 10000;
  .aRow {
    height: 32px;
    line-height: 32px;
    color: #323233;
    font-size: 13px;
    cursor: pointer;
    padding: 0 12px;
    display: flex;
    justify-content: center;
    align-items: center;
    &:hover {
      background-color: #f2f6fe;
      color: #000;
    }
    .icon {
      height: 16px;
      margin-right: 3px;
    }
  }
}
</style>
