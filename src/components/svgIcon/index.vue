<template>
  <svg aria-hidden="true" class="svg-icon" :width="props.size" :height="props.size">
    <use :xlink:href="symbolId" :fill="props.color" />
  </svg>
</template>
<script>
export default {
  name: "SvgIcon",
};
</script>
<script setup>
import { computed } from "vue";
const props = defineProps({
  prefix: {
    type: String,
    default: "icon",
  },
  name: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    default: "#333",
  },
  size: {
    type: String,
    default: "18px",
  },
});

const symbolId = computed(() => `#${props.prefix}-${props.name}`);
</script>
<style scoped>
.svg-icon {
  fill: currentColor;
}
</style>
