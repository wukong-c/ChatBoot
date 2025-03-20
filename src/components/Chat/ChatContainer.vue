<template>
  <div class="chat-container">
    <div class="message-list" ref="messageListRef">
      <div v-if="loading && messages.length === 0" class="loading-container">
        <el-skeleton :rows="5" animated />
      </div>

      <div v-else-if="messages.length === 0" class="empty-container">
        <div class="welcome-message">
          <h2>欢迎使用聊天助手</h2>
          <p>您可以开始新的对话，或者从左侧选择已有会话。</p>
          <div class="examples">
            <div class="example-title">示例问题：</div>
            <div
              v-for="(example, index) in examples"
              :key="index"
              class="example-item"
              @click="handleExampleClick(example)"
            >
              <el-icon><ChatLineRound /></el-icon>
              <span>{{ example }}</span>
            </div>
          </div>
        </div>
      </div>

      <template v-else>
        <ChatMessage
          v-for="(message, index) in props.messages"
          :key="message.id || 'streaming-' + index"
          :message="message"
          :is-streaming="index === streamingIndex.value"
        />
      </template>
    </div>

    <div class="input-container">
      <ChatInput :loading="inputLoading" :disabled="streamingData !== null" @send="handleSendMessage" />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onBeforeUnmount } from "vue";
import { ElMessage } from "element-plus";
import { ChatLineRound } from "@element-plus/icons-vue";
import ChatMessage from "./ChatMessage.vue";
import ChatInput from "./ChatInput.vue";

const props = defineProps({
  sessionId: {
    type: Number,
    default: null,
  },
  messages: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["send", "stream"]);

const messageListRef = ref(null);
const inputLoading = ref(false);
const streamingData = ref(null);
const streamingIndex = ref(-1);
let eventSource = null;

// 示例问题
const examples = [
  "介绍一下Python和JavaScript的主要区别",
  "解释一下Transformer模型的工作原理",
  "如何使用vue3和element-plus创建一个待办事项应用？",
  "推荐一些学习前端开发的优质资源",
];

// 处理发送消息
const handleSendMessage = message => {
  if (streamingData.value !== null) {
    return;
  }

  inputLoading.value = true;

  // 告知父组件发送消息
  emit("send", {
    message,
    sessionId: props.sessionId,
    streaming: true, // 使用流式输出
  });
};

// 处理示例问题点击
const handleExampleClick = example => {
  handleSendMessage(example);
};

// 开始流式输出
const startStreaming = initialMessage => {
  streamingData.value = {
    content: "",
    initialMessage,
  };

  // 计算流式消息在数组中的索引
  console.log("props.messages", props.messages);
  streamingIndex.value = props.messages.length - 1;
  console.log("开始流式输出，索引设置为:", streamingIndex.value);
};

// 添加流式内容（适用于fetchEventSource）
const appendStreamingContent = data => {
  if (!streamingData.value) return;
  console.log("props.messages", props.messages);

  if (data.message && data.message.content) {
    streamingData.value.content += data.message.content;

    // 发送流式更新到父组件
    emit("stream", {
      content: streamingData.value.content,
      messageId: data.message.id || streamingData.value.initialMessage.id,
      sessionId: data.session_id,
      index: streamingIndex.value,
      done: data.done,
    });
  }
};

// 完成流式输出
const finishStreaming = () => {
  console.log("完成流式输出，重置状态");
  streamingData.value = null;
  streamingIndex.value = -1;
  inputLoading.value = false;

  // 通知父组件流式处理结束
  emit("stream-end");
};

// 取消流式输出
const cancelStreaming = () => {
  if (eventSource) {
    eventSource?.close?.();
    eventSource = null;
  }

  finishStreaming();
};

// 设置事件源
const setEventSource = source => {
  eventSource = source;
};

// 监听消息列表变化，自动滚动到底部
watch(
  () => props.messages,
  async () => {
    if (props.messages.length > 0) {
      await nextTick();
      if (messageListRef.value) {
        messageListRef.value.scrollTop = messageListRef.value.scrollHeight;
      }
    }
  },
  { deep: true }
);

// 监听加载状态变化
watch(
  () => props.loading,
  newVal => {
    inputLoading.value = newVal;
  }
);

// 在组件销毁前清理
onBeforeUnmount(() => {
  if (eventSource) {
    eventSource.close();
    eventSource = null;
  }
});

// 暴露组件方法给父组件
defineExpose({
  handleSendMessage,
  startStreaming,
  appendStreamingContent,
  finishStreaming,
  setEventSource,
  cancelStreaming,
});
</script>

<style lang="scss" scoped>
.chat-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;

  .message-list {
    flex: 1;
    overflow-y: auto;
    padding: 20px;

    .loading-container,
    .empty-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100%;

      .welcome-message {
        text-align: center;
        max-width: 600px;

        h2 {
          margin-bottom: 16px;
          color: #409eff;
        }

        p {
          margin-bottom: 24px;
          color: #606266;
        }

        .examples {
          text-align: left;

          .example-title {
            margin-bottom: 12px;
            font-weight: bold;
            color: #606266;
          }

          .example-item {
            display: flex;
            align-items: center;
            padding: 12px;
            margin-bottom: 8px;
            background-color: #f5f7fa;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s;

            .el-icon {
              margin-right: 8px;
              color: #409eff;
            }

            &:hover {
              background-color: #ecf5ff;
              transform: translateY(-2px);
            }
          }
        }
      }
    }
  }

  .input-container {
    flex-shrink: 0;
  }
}
</style>
