<template>
  <div :class="['message-container', { 'user-message': isUser, 'ai-message': !isUser }]">
    <div class="avatar">
      <el-avatar :icon="isUser ? 'User' : 'ChatSquare'" :size="40" :color="isUser ? '#409EFF' : '#67C23A'">
        {{ isUser ? "U" : "AI" }}
      </el-avatar>
    </div>
    <div class="message-content">
      <div class="message-header">
        <span class="role">{{ isUser ? "用户" : "AI助手" }}</span>
        <span class="time">{{ formatTime(message.created_at) }}</span>
      </div>
      <div class="message-body markdown-body" v-html="formattedContent"></div>
      <div v-if="!isUser && isStreaming" class="typing-indicator">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
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

// 格式化消息内容，支持Markdown
const formattedContent = computed(() => {
  if (!props.message.content) return "";

  // 使用marked转换Markdown为HTML
  const rawHtml = marked.parse(props.message.content);

  // 使用DOMPurify清理HTML，防止XSS
  return DOMPurify.sanitize(rawHtml);
});

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
    background-color: rgba(64, 158, 255, 0.05);
  }

  &.ai-message {
    background-color: rgba(103, 194, 58, 0.05);
  }

  .avatar {
    margin-right: 12px;
    flex-shrink: 0;
  }

  .message-content {
    flex: 1;

    .message-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 6px;

      .role {
        font-weight: bold;
      }

      .time {
        color: #999;
        font-size: 12px;
      }
    }

    .message-body {
      line-height: 1.6;
      white-space: pre-wrap;
      word-break: break-word;

      code {
        background-color: #f6f8fa;
        padding: 2px 4px;
        border-radius: 3px;
        font-family: SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace;
      }

      pre {
        background-color: #f6f8fa;
        padding: 16px;
        border-radius: 6px;
        overflow-x: auto;
      }
    }

    .typing-indicator {
      display: inline-flex;
      align-items: center;
      margin-top: 8px;

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

// Markdown样式
:deep(.markdown-body) {
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    margin-top: 16px;
    margin-bottom: 16px;
    font-weight: 600;
  }

  ul,
  ol {
    padding-left: 20px;
  }

  table {
    border-collapse: collapse;
    margin-bottom: 16px;

    th,
    td {
      border: 1px solid #dfe2e5;
      padding: 6px 13px;
    }

    th {
      background-color: #f6f8fa;
    }
  }

  blockquote {
    padding: 0 16px;
    color: #6a737d;
    border-left: 4px solid #dfe2e5;
    margin: 16px 0;
  }

  img {
    max-width: 100%;
  }
}
</style>
