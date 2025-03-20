<template>
  <div class="chat-input-container">
    <div class="input-wrapper">
      <el-input
        v-model="inputMessage"
        type="textarea"
        :rows="3"
        :placeholder="disabled ? '正在生成回复中...' : placeholder"
        resize="none"
        :disabled="disabled"
        @keydown.enter.exact.prevent="sendMessage"
      />
    </div>
    <div class="button-wrapper">
      <el-tooltip :content="disabled ? '等待AI回复完成' : '按 Enter 发送'" placement="top">
        <el-button
          type="primary"
          :disabled="!inputMessage.trim() || loading || disabled"
          :loading="loading"
          @click="sendMessage"
        >
          发送
        </el-button>
      </el-tooltip>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  loading: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  placeholder: {
    type: String,
    default: '输入消息，按Enter发送...'
  }
});

const emit = defineEmits(['send']);

const inputMessage = ref('');

const sendMessage = () => {
  const message = inputMessage.value.trim();
  if (!message || props.loading || props.disabled) return;
  
  emit('send', message);
  inputMessage.value = '';
};
</script>

<style lang="scss" scoped>
.chat-input-container {
  display: flex;
  flex-direction: column;
  padding: 16px;
  border-top: 1px solid #e4e7ed;
  background-color: #fff;
  
  .input-wrapper {
    margin-bottom: 12px;
  }
  
  .button-wrapper {
    display: flex;
    justify-content: flex-end;
  }
}
</style> 