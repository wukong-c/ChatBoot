<template>
  <div class="session-list-container">
    <div class="header">
      <h3>会话列表</h3>
      <el-button type="primary" size="small" @click="createNewSession">
        <el-icon><Plus /></el-icon>
        新会话
      </el-button>
    </div>

    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="5" animated />
    </div>

    <div v-else-if="sessions.length === 0" class="empty-container">
      <el-empty description="暂无聊天会话" />
    </div>

    <div v-else class="sessions-wrapper">
      <div
        v-for="session in sessions"
        :key="session.id"
        :class="['session-item', { active: session.id === activeSessionId }]"
      >
        <div class="title" @click="selectSession(session.id)">
          <el-icon><ChatDotRound /></el-icon>
          <span class="session-title">{{ session.title }}</span>
        </div>
        <div class="actions">
          <el-dropdown trigger="click" @command="handleCommand($event, session.id)">
            <el-icon><More /></el-icon>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="rename">重命名</el-dropdown-item>
                <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </div>

    <!-- 重命名对话框 -->
    <el-dialog v-model="renameDialogVisible" title="重命名会话" width="360px">
      <el-form :model="renameForm" @submit.prevent="confirmRename">
        <el-form-item label="会话名称">
          <el-input v-model="renameForm.title" placeholder="请输入会话名称" autofocus />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="renameDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmRename">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { ChatDotRound, Plus, More } from "@element-plus/icons-vue";

const props = defineProps({
  sessions: {
    type: Array,
    default: () => [],
  },
  activeSessionId: {
    type: Number,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["select", "create", "rename", "delete"]);

// 选择会话
const selectSession = sessionId => {
  emit("select", sessionId);
};

// 创建新会话
const createNewSession = () => {
  emit("create");
};

// 重命名相关
const renameDialogVisible = ref(false);
const renameForm = ref({ title: "", sessionId: null });

const handleCommand = (command, sessionId) => {
  if (command === "rename") {
    // 查找会话标题
    const session = props.sessions.find(s => s.id === sessionId);
    if (session) {
      renameForm.value = {
        title: session.title,
        sessionId,
      };
      renameDialogVisible.value = true;
    }
  } else if (command === "delete") {
    ElMessageBox.confirm("确定要删除此会话吗？删除后无法恢复。", "删除会话", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    })
      .then(() => {
        emit("delete", sessionId);
      })
      .catch(() => {});
  }
};

const confirmRename = () => {
  if (!renameForm.value.title.trim()) {
    ElMessage.warning("会话名称不能为空");
    return;
  }

  emit("rename", {
    sessionId: renameForm.value.sessionId,
    title: renameForm.value.title.trim(),
  });

  renameDialogVisible.value = false;
};
</script>

<style lang="scss" scoped>
.session-list-container {
  height: 100%;
  display: flex;
  flex-direction: column;

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid #e4e7ed;

    h3 {
      margin: 0;
      font-size: 16px;
    }
  }

  .loading-container,
  .empty-container {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
  }

  .sessions-wrapper {
    flex: 1;
    overflow-y: auto;
    padding: 8px;

    .session-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px;
      border-radius: 6px;
      cursor: pointer;
      margin-bottom: 4px;
      transition: background-color 0.2s;

      &:hover {
        background-color: #f5f7fa;
      }

      &.active {
        background-color: #ecf5ff;
      }

      .title {
        display: flex;
        align-items: center;

        .el-icon {
          margin-right: 8px;
          color: #409eff;
        }

        .session-title {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 180px;
        }
      }

      .actions {
        opacity: 0;
        transition: opacity 0.2s;

        .el-icon {
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;

          &:hover {
            background-color: rgba(0, 0, 0, 0.05);
          }
        }
      }

      &:hover .actions {
        opacity: 1;
      }
    }
  }
}
</style>
