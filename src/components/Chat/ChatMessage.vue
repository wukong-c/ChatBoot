<template>
  <div :class="['message-container', { 'user-message': isUser, 'ai-message': !isUser }]">
    <div class="avatar">
      <el-avatar :icon="isUser ? 'User' : 'ChatSquare'" :size="40" :color="isUser ? '#409EFF' : '#67C23A'">
        {{ isUser ? "U" : "AI" }}
      </el-avatar>
    </div>
    <div class="message-content">
      <div class="message-header">
        <span class="time">{{ formatTime(message.created_at) }}</span>
      </div>
      <div
        v-if="formattedContent"
        class="message-body markdown-body"
        :class="{ isUser: isUser }"
        v-html="formattedContent"
      ></div>
      <div v-if="!isUser && isStreaming" class="typing-indicator">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { marked } from "marked";
import DOMPurify from "dompurify";
import moment from "moment";
import "github-markdown-css/github-markdown.css";
// 配置 marked 选项
marked.setOptions({
  breaks: true, // 允许回车换行
  gfm: true, // 允许 GitHub 风格的 markdown
});

const props = defineProps({
  message: {
    type: Object,
    required: true,
  },
  isStreaming: {
    type: Boolean,
    default: false,
  },
});

const isUser = computed(() => props.message.role === "user");
const cachedContent = ref("");

// 使用缓存机制优化Markdown解析
watch(
  () => props.message.content,
  (newContent) => {
    if (!newContent) {
      cachedContent.value = "";
      return;
    }
    // 使用marked转换Markdown为HTML
    const rawHtml = marked.parse(newContent);
    // 使用DOMPurify清理HTML，防止XSS
    cachedContent.value = DOMPurify.sanitize(rawHtml);
  },
  { immediate: true }
);

// 格式化消息内容，使用缓存的结果
const formattedContent = computed(() => cachedContent.value);

// 格式化时间
const formatTime = timestamp => {
  if (!timestamp) return "";
  return moment(timestamp).format("YYYY-MM-DD HH:mm:ss");
};
</script>

<style lang="scss" scoped>
.message-container {
  display: flex;
  margin-bottom: 20px;
  padding: 10px;
  border-radius: 8px;

  &.user-message {
    flex-direction: row-reverse; // 用户消息靠右

    .avatar {
      margin-left: 12px;
      margin-right: 0;
    }

    .message-content {
      .message-header {
        flex-direction: row-reverse; // 用户信息靠右
      }
    }
  }

  .avatar {
    margin-right: 12px;
    flex-shrink: 0;
  }

  .message-content {
    flex: 0 1 auto;
    max-width: 80%;
    width: fit-content;

    .message-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 6px;

      .time {
        color: #999;
        font-size: 12px;
        padding-right: 6px;
      }
    }

    .message-body {
      line-height: 24px;
      word-break: break-word;
      background-color: #fff;
      padding: 10px;
      border-radius: 8px;
      box-shadow: 0 0 2px rgba(0, 0, 0, 0.2);
      &.isUser {
        * {
          white-space: pre-wrap;
        }
      }
    }

    .typing-indicator {
      display: flex;
      align-items: center;
      margin-top: 8px;
      padding: 8px;
      background-color: #fff;
      border-radius: 8px;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
      width: fit-content;

      span {
        display: inline-block;
        width: 8px;
        height: 8px;
        margin-right: 4px;
        background-color: #67c23a;
        border-radius: 50%;
        opacity: 0.6;
        animation: typing 1.5s infinite ease-in-out;

        &:nth-child(1) {
          animation-delay: 0s;
        }

        &:nth-child(2) {
          animation-delay: 0.2s;
        }

        &:nth-child(3) {
          animation-delay: 0.4s;
          margin-right: 0;
        }
      }
    }
  }
}

@keyframes typing {
  0%,
  60%,
  100% {
    transform: translateY(0);
    opacity: 0.6;
  }
  30% {
    transform: translateY(-4px);
    opacity: 1;
  }
}
</style>
