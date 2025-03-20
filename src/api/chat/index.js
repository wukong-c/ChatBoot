import $axios from "@/plugins/axios";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import permission from "@/utils/permission";
export default {
  // 发送聊天消息（标准响应）
  sendMessage: params => {
    return $axios({
      method: "post",
      url: "/api/v1/chat/chat",
      data: params,
      isSourceData: true,
    });
  },

  // 发送聊天消息（流式响应）
  sendMessageStreaming: async (params, onOpen, onChunk, onDone, onError) => {
    // 创建请求URL
    const queryParams = new URLSearchParams();
    if (params.session_id) {
      queryParams.append("session_id", params.session_id);
    }
    if (params.new_session_title) {
      queryParams.append("new_session_title", params.new_session_title);
    }

    // 消息内容需要单独处理
    queryParams.append("message", params.message);

    // 创建完整URL
    const url = `${$axios.defaults.baseURL}/api/v1/chat/stream?${queryParams.toString()}`;

    // 获取认证token
    const token = permission.getToken();

    // 控制器用于手动关闭连接
    const controller = new AbortController();

    try {
      await fetchEventSource(url, {
        method: "GET",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "application/json",
        },
        signal: controller.signal,
        onmessage(event) {
          if (event.data === "[DONE]") {
            controller.abort();
            if (onDone) onDone();
            return;
          }
          try {
            const data = JSON.parse(event.data);
            if (onChunk) onChunk(data);
          } catch (error) {
            console.error("Error parsing SSE message:", error);
          }
        },
        onopen(response) {
          // 返回控制器（可以用于手动关闭）
          let eventSource = {
            close: () => controller.abort(),
          };
          if (onOpen) onOpen(eventSource);
          if (response.ok && response.status === 200) {
            return;
          }
          throw new Error(`Failed to open SSE connection: ${response.status} ${response.statusText}`);
        },
        onerror(err) {
          console.error("SSE error:", err);
          if (onError) onError(err);
          throw err; // 这将导致重试或终止连接
        },
      });
    } catch (error) {
      console.error("fetchEventSource error:", error);
      if (onError) onError(error);
    }
    console.log("controller", controller);
  },

  // 获取所有聊天会话
  getChatSessions: () => {
    return $axios({
      method: "get",
      url: "/api/v1/chat/sessions",
      isSourceData: true,
    });
  },

  // 获取特定会话及其消息
  getChatSession: sessionId => {
    return $axios({
      method: "get",
      url: `/api/v1/chat/sessions/${sessionId}`,
      isSourceData: true,
    });
  },

  // 创建新的聊天会话
  createChatSession: params => {
    return $axios({
      method: "post",
      url: "/api/v1/chat/sessions",
      data: params,
      isSourceData: true,
    });
  },

  // 更新聊天会话
  updateChatSession: (sessionId, params) => {
    return $axios({
      method: "put",
      url: `/api/v1/chat/sessions/${sessionId}`,
      data: params,
      isSourceData: true,
    });
  },

  // 删除聊天会话
  deleteChatSession: sessionId => {
    return $axios({
      method: "delete",
      url: `/api/v1/chat/sessions/${sessionId}`,
      isSourceData: true,
    });
  },
};
