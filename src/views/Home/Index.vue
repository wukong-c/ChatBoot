<template>
  <div class="home-container">
    <el-container class="main-container">
      <el-aside width="280px" class="aside">
        <SessionList
          :sessions="sessions"
          :activeSessionId="activeSession?.id"
          :loading="sessionsLoading"
          @select="handleSelectSession"
          @create="handleCreateSession"
          @rename="handleRenameSession"
          @delete="handleDeleteSession"
        />
      </el-aside>

      <el-main class="main">
        <div class="header">
          <h2 class="session-title">{{ activeSession?.title || "新的对话" }}</h2>
          <div class="user-info">
            <el-dropdown @command="handleCommand">
              <el-avatar :size="40" :icon="'User'">
                {{ userInfo?.username?.charAt(0)?.toUpperCase() || "U" }}
              </el-avatar>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="profile">个人信息</el-dropdown-item>
                  <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>

        <div class="chat-wrapper">
          <ChatContainer
            ref="chatContainerRef"
            :messages="messages"
            :loading="messageLoading"
            :session-id="activeSession?.id"
            @send="handleSendMessage"
            @stream="handleStreamUpdate"
            @stream-end="handleStreamEnd"
          />
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { ElMessage, ElMessageBox } from "element-plus";
import permission from "@/utils/permission";
import SessionList from "@/components/Chat/SessionList.vue";
import ChatContainer from "@/components/Chat/ChatContainer.vue";
import chatApi from "@/api/chat";

const router = useRouter();

// 会话状态
const sessions = ref([]);
const activeSession = ref(null);
const messages = ref([]);
const sessionsLoading = ref(false);
const messageLoading = ref(false);
const chatContainerRef = ref(null);
let currentEventSource = null;

// 用户信息
const userInfo = ref(JSON.parse(localStorage.getItem("locaUserInfo") || "{}"));

// 加载会话列表
const loadSessions = async () => {
  try {
    sessionsLoading.value = true;
    const response = await chatApi.getChatSessions();
    if (response && response.sessions) {
      sessions.value = response.sessions;
    }
  } catch (error) {
    ElMessage.error("获取会话列表失败");
    console.error(error);
  } finally {
    sessionsLoading.value = false;
  }
};

// 加载特定会话及其消息
const loadSessionMessages = async sessionId => {
  try {
    messageLoading.value = true;
    const session = await chatApi.getChatSession(sessionId);
    if (session) {
      activeSession.value = session;
      messages.value = session.messages || [];
    }
  } catch (error) {
    ElMessage.error("获取会话消息失败");
    console.error(error);
  } finally {
    messageLoading.value = false;
  }
};

// 选择会话
const handleSelectSession = sessionId => {
  if (activeSession.value?.id === sessionId) return;

  // 如果有流式输出，取消它
  cancelCurrentStreaming();

  // 清空当前消息
  messages.value = [];

  // 加载选中的会话
  loadSessionMessages(sessionId);
};

// 创建新会话
const handleCreateSession = async () => {
  try {
    const newSession = await chatApi.createChatSession({
      title: "新会话",
    });

    if (newSession) {
      // 添加到会话列表
      sessions.value = [newSession, ...sessions.value];

      // 激活新会话
      activeSession.value = newSession;
      messages.value = [];
    }
  } catch (error) {
    ElMessage.error("创建会话失败");
    console.error(error);
  }
};

// 重命名会话
const handleRenameSession = async ({ sessionId, title }) => {
  try {
    const updatedSession = await chatApi.updateChatSession(sessionId, { title });

    if (updatedSession) {
      // 更新会话列表
      const index = sessions.value.findIndex(s => s.id === sessionId);
      if (index !== -1) {
        sessions.value[index] = updatedSession;
      }

      // 如果是当前活跃会话，也更新
      if (activeSession.value?.id === sessionId) {
        activeSession.value = updatedSession;
      }

      ElMessage.success("重命名成功");
    }
  } catch (error) {
    ElMessage.error("重命名失败");
    console.error(error);
  }
};

// 删除会话
const handleDeleteSession = async sessionId => {
  try {
    await chatApi.deleteChatSession(sessionId);

    // 从会话列表中移除
    sessions.value = sessions.value.filter(s => s.id !== sessionId);

    // 如果删除的是当前活跃会话，则清空
    if (activeSession.value?.id === sessionId) {
      activeSession.value = null;
      messages.value = [];
    }

    ElMessage.success("删除成功");
  } catch (error) {
    ElMessage.error("删除失败");
    console.error(error);
  }
};

// 取消当前流式输出
const cancelCurrentStreaming = () => {
  console.log("currentEventSource", currentEventSource);
  if (currentEventSource) {
    currentEventSource.close();
    currentEventSource = null;
  }

  if (chatContainerRef.value) {
    chatContainerRef.value.cancelStreaming();
  }
};

// 处理流式消息更新
const handleStreamUpdate = data => {
  if (data.index >= 0 && data.index < messages.value.length) {
    // 创建一个消息的副本并更新内容
    const updatedMessage = { ...messages.value[data.index], content: data.content };

    // 创建一个新的消息数组，替换特定索引的消息
    const newMessages = [...messages.value];
    newMessages[data.index] = updatedMessage;

    // 更新消息数组
    messages.value = newMessages;
    console.log("消息数组已更新，长度:", messages.value.length);
  }
};

// 处理流式处理结束
const handleStreamEnd = () => {
  console.log("流式处理结束");

  // 如果是新会话，需要更新会话列表
  if (!activeSession.value || !activeSession.value.id) {
    loadSessions().then(() => {
      // 找到新创建的会话（最新的会话）
      if (sessions.value.length > 0) {
        activeSession.value = sessions.value[0];
      }
    });
  }
};

// 发送消息
const handleSendMessage = async ({ message, sessionId, streaming = false }) => {
  try {
    messageLoading.value = true;

    // 先将用户消息添加到界面展示（乐观更新）
    const tempUserMessage = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: message,
      created_at: new Date().toISOString(),
    };
    messages.value = [...messages.value, tempUserMessage];

    if (streaming) {
      // 使用流式响应

      // 创建临时消息对象
      const tempAIMessage = {
        id: Date.now(),
        user_id: null,
        session_id: sessionId,
        role: "assistant",
        content: "",
        created_at: new Date().toISOString(),
      };

      // 将临时AI消息添加到消息列表
      messages.value = [...messages.value, tempAIMessage];

      // 事件处理函数
      const onChunk = data => {
        chatContainerRef.value.appendStreamingContent(data);
      };
      const onOpen = eventSource => {
        currentEventSource = eventSource;
        chatContainerRef.value.setEventSource(currentEventSource);
      };
      const onDone = () => {
        // 重置状态
        messageLoading.value = false;
        currentEventSource = null;

        // 结束流式输出
        chatContainerRef.value.finishStreaming();
      };

      const onError = error => {
        ElMessage.error("获取响应失败: " + (error.message || "未知错误"));
        messageLoading.value = false;
        currentEventSource = null;

        // 结束流式输出
        chatContainerRef.value.finishStreaming();
      };

      // 在开始新请求前关闭现有连接
      if (currentEventSource) {
        currentEventSource.close();
        currentEventSource = null;
      }

      // 准备请求参数
      const params = {
        message,
        session_id: sessionId,
        new_session_title: sessionId ? undefined : message.substring(0, 20) + "...",
      };

      // 启动流式请求
      try {
        nextTick(() => {
          // 启动流式响应UI
          chatContainerRef.value.startStreaming(tempAIMessage);
          currentEventSource = chatApi.sendMessageStreaming(params, onOpen, onChunk, onDone, onError);
          chatContainerRef.value.setEventSource(currentEventSource);
        });
      } catch (error) {
        onError(error);
      }
    } else {
      // 使用常规响应
      const response = await chatApi.sendMessage({
        message,
        session_id: sessionId,
        new_session_title: sessionId ? undefined : message.substring(0, 20) + "...",
      });

      if (response) {
        // 如果是新会话，需要更新会话列表和当前活跃会话
        if (!sessionId) {
          // 刷新会话列表
          await loadSessions();

          // 设置新的活跃会话
          const newSessionId = response.session_id;
          const newSession = sessions.value.find(s => s.id === newSessionId);

          if (newSession) {
            activeSession.value = newSession;
          }
        }

        // 添加AI回复到消息列表
        if (response.message) {
          messages.value = [...messages.value, response.message];
        }
      }

      messageLoading.value = false;
    }
  } catch (error) {
    ElMessage.error("发送消息失败: " + error.message);
    console.error(error);
    messageLoading.value = false;
  }
};

// 处理用户下拉菜单命令
const handleCommand = command => {
  if (command === "logout") {
    ElMessageBox.confirm("确定要退出登录吗？", "退出登录", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    })
      .then(() => {
        // 取消所有流式输出
        cancelCurrentStreaming();
        permission.logout();
      })
      .catch(() => {});
  } else if (command === "profile") {
    ElMessage.info("功能开发中");
  }
};

// 页面初始化
onMounted(() => {
  loadSessions();
});

// 组件卸载前清理
onBeforeUnmount(() => {
  cancelCurrentStreaming();
});
</script>

<style lang="scss" scoped>
.home-container {
  height: 100vh;
  overflow: hidden;

  .main-container {
    height: 100%;

    .aside {
      background-color: #f5f7fa;
      border-right: 1px solid #e4e7ed;
      height: 100%;
    }

    .main {
      padding: 0;
      display: flex;
      flex-direction: column;
      height: 100%;

      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 24px;
        border-bottom: 1px solid #e4e7ed;

        .session-title {
          margin: 0;
          font-size: 18px;
          color: #303133;
        }

        .user-info {
          .el-avatar {
            cursor: pointer;
            background-color: #409eff;
            color: #fff;
          }
        }
      }

      .chat-wrapper {
        flex: 1;
        padding: 16px;
        overflow: hidden;
      }
    }
  }
}
</style>
