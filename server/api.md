# ChatGPT 克隆API文档

## 基本信息

- **基础URL**: `http://localhost:8000`
- **API前缀**: `/api/v1`
- **完整API文档**: 启动服务后访问 `http://localhost:8000/docs` (Swagger UI)
- **LangChain版本**: 0.3.x (最新主要版本)

## 环境配置

本应用使用以下环境变量进行配置：

```
# OpenAI配置
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL_NAME=gpt-3.5-turbo
OPENAI_BASE_URL=https://api.openai.com/v1  # 可自定义API端点

# 安全配置
SECRET_KEY=your_secret_key_here
ACCESS_TOKEN_EXPIRE_MINUTES=10080  # 7天

# 数据库配置
DATABASE_URL=sqlite:///./chatapp.db
```

## 认证

所有API请求（除了登录和注册）都需要在HTTP头中包含Bearer Token：

```
Authorization: Bearer {your_access_token}
```

### 用户认证

#### 注册新用户

```
POST /api/v1/auth/register
```

请求体:

```json
{
  "username": "用户名",
  "email": "user@example.com",
  "password": "密码"
}
```

响应:

```json
{
  "id": 1,
  "username": "用户名",
  "email": "user@example.com",
  "is_active": true,
  "created_at": "2023-01-01T00:00:00",
  "updated_at": null
}
```

#### 登录获取令牌

```
POST /api/v1/auth/login/access-token
```

请求体（表单数据）:

```
username: 用户名
password: 密码
```

响应:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

#### 获取当前用户信息

```
GET /api/v1/auth/me
```

响应:

```json
{
  "id": 1,
  "username": "用户名",
  "email": "user@example.com",
  "is_active": true,
  "created_at": "2023-01-01T00:00:00",
  "updated_at": null
}
```

## 聊天功能

### 发送聊天消息

```
POST /api/v1/chat/chat
```

请求体:

```json
{
  "session_id": 1,          // 可选，如果不提供则创建新会话
  "message": "你好！",
  "new_session_title": "新聊天" // 可选，创建新会话时的标题
}
```

响应:

```json
{
  "session_id": 1,
  "message": {
    "id": 2,
    "role": "assistant",
    "content": "你好！有什么我可以帮助你的？",
    "session_id": 1,
    "created_at": "2023-01-01T00:00:01"
  }
}
```

### 会话管理

#### 获取所有聊天会话

```
GET /api/v1/chat/sessions
```

响应:

```json
{
  "sessions": [
    {
      "id": 1,
      "title": "关于Python的讨论",
      "user_id": 1,
      "created_at": "2023-01-01T00:00:00",
      "updated_at": "2023-01-01T00:10:00",
      "is_active": true,
      "messages": []
    },
    {
      "id": 2,
      "title": "AI技术探讨",
      "user_id": 1,
      "created_at": "2023-01-02T00:00:00",
      "updated_at": "2023-01-02T00:15:00",
      "is_active": true,
      "messages": []
    }
  ]
}
```

#### 获取特定会话及其消息

```
GET /api/v1/chat/sessions/{session_id}
```

响应:

```json
{
  "id": 1,
  "title": "关于Python的讨论",
  "user_id": 1,
  "created_at": "2023-01-01T00:00:00",
  "updated_at": "2023-01-01T00:10:00",
  "is_active": true,
  "messages": [
    {
      "id": 1,
      "role": "user",
      "content": "Python和JavaScript的主要区别是什么？",
      "session_id": 1,
      "created_at": "2023-01-01T00:00:00"
    },
    {
      "id": 2,
      "role": "assistant",
      "content": "Python和JavaScript有几个主要区别：\n\n1. **用途不同**：Python主要用于后端开发、数据分析、AI等；JavaScript最初设计用于web前端，现在也可用于后端(Node.js)。\n\n2. **类型系统**：Python是动态强类型语言；JavaScript是动态弱类型语言。\n\n3. **语法**：Python使用缩进表示代码块；JavaScript使用花括号。\n\n4. **执行环境**：Python通常需要解释器；JavaScript主要在浏览器中运行，也可通过Node.js在服务器运行。\n\n5. **并发模型**：JavaScript使用事件循环和异步回调；Python有多线程、多进程和异步IO。",
      "session_id": 1,
      "created_at": "2023-01-01T00:00:01"
    }
  ]
}
```

#### 创建新的聊天会话

```
POST /api/v1/chat/sessions
```

请求体:

```json
{
  "title": "新会话标题"
}
```

响应:

```json
{
  "id": 3,
  "title": "新会话标题",
  "user_id": 1,
  "created_at": "2023-01-03T00:00:00",
  "updated_at": null,
  "is_active": true,
  "messages": []
}
```

#### 更新聊天会话

```
PUT /api/v1/chat/sessions/{session_id}
```

请求体:

```json
{
  "title": "更新后的标题",
  "is_active": true
}
```

响应:

```json
{
  "id": 1,
  "title": "更新后的标题",
  "user_id": 1,
  "created_at": "2023-01-01T00:00:00",
  "updated_at": "2023-01-03T10:00:00",
  "is_active": true,
  "messages": []
}
```

#### 删除聊天会话

```
DELETE /api/v1/chat/sessions/{session_id}
```

响应状态码: `204 No Content`

## 使用指南

### 完整流程示例

1. **注册用户**

```bash
curl -X 'POST' \
  'http://localhost:8000/api/v1/auth/register' \
  -H 'Content-Type: application/json' \
  -d '{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123"
}'
```

2. **登录获取令牌**

```bash
curl -X 'POST' \
  'http://localhost:8000/api/v1/auth/login/access-token' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'username=testuser&password=password123'
```

保存返回的access_token

3. **发送一条消息并创建新会话**

```bash
curl -X 'POST' \
  'http://localhost:8000/api/v1/chat/chat' \
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
  "message": "你能告诉我关于人工智能的基础知识吗？",
  "new_session_title": "AI基础知识"
}'
```

4. **查看所有会话**

```bash
curl -X 'GET' \
  'http://localhost:8000/api/v1/chat/sessions' \
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN'
```

5. **查看特定会话的消息**

```bash
curl -X 'GET' \
  'http://localhost:8000/api/v1/chat/sessions/1' \
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN'
```

6. **在已有会话中发送新消息**

```bash
curl -X 'POST' \
  'http://localhost:8000/api/v1/chat/chat' \
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
  "session_id": 1,
  "message": "请解释一下机器学习和深度学习的区别"
}'
```

### 错误处理

API使用标准HTTP状态码表示请求结果：

- 200: 请求成功
- 201: 资源创建成功
- 204: 删除成功
- 400: 无效请求或参数
- 401: 未授权/未认证
- 403: 禁止访问
- 404: 资源不存在
- 500: 服务器内部错误

错误响应格式:

```json
{
  "detail": "错误描述信息"
}
``` 