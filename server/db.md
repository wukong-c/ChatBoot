# ChatGPT克隆应用 - 数据库设计与安装指南

## 数据库选择

本项目使用SQLite作为默认数据库，它是一个轻量级的文件型数据库，不需要额外的数据库服务器，适合开发和小型应用。

对于生产环境，可以考虑切换到PostgreSQL等更强大的数据库系统。

## 安装与配置

### SQLite安装

SQLite通常已预装在大多数Python环境中，无需额外安装。如果需要，可以使用以下命令安装：

```bash
# Ubuntu/Debian
sudo apt-get install sqlite3

# CentOS/RHEL
sudo yum install sqlite

# macOS (使用Homebrew)
brew install sqlite3

# Windows
# 下载 SQLite 预编译二进制文件: https://www.sqlite.org/download.html
```

### 数据库配置

在`.env`文件中配置数据库URL：

```
DATABASE_URL=sqlite:///./chatapp.db
```

如果需要切换到其他数据库（如PostgreSQL），可以修改此配置项：

```
DATABASE_URL=postgresql://user:password@localhost/dbname
```

## 数据库模型设计

### 1. 用户表 (users)

用于存储用户信息：

| 字段名 | 类型 | 说明 | 特性 |
|--------|------|------|------|
| id | Integer | 用户ID | 主键、自增、索引 |
| username | String | 用户名 | 唯一、索引 |
| email | String | 电子邮件 | 唯一、索引 |
| hashed_password | String | 哈希密码 | 非明文存储 |
| is_active | Boolean | 用户是否激活 | 默认为True |
| created_at | DateTime | 创建时间 | 自动设置为当前时间 |
| updated_at | DateTime | 更新时间 | 自动更新 |

表定义：
```python
class User(Base):
    """用户模型"""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
```

### 2. 聊天会话表 (chat_sessions)

存储用户的聊天会话信息：

| 字段名 | 类型 | 说明 | 特性 |
|--------|------|------|------|
| id | Integer | 会话ID | 主键、自增、索引 |
| title | String | 会话标题 | 索引 |
| user_id | Integer | 用户ID | 外键(users.id) |
| created_at | DateTime | 创建时间 | 自动设置为当前时间 |
| updated_at | DateTime | 更新时间 | 自动更新 |
| is_active | Boolean | 会话是否激活 | 默认为True |

表定义：
```python
class ChatSession(Base):
    """聊天会话模型"""
    __tablename__ = "chat_sessions"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    is_active = Column(Boolean, default=True)

    # 关系
    user = relationship("User", backref="chat_sessions")
    messages = relationship("ChatMessage", back_populates="session", cascade="all, delete-orphan")
```

### 3. 聊天消息表 (chat_messages)

存储聊天消息内容：

| 字段名 | 类型 | 说明 | 特性 |
|--------|------|------|------|
| id | Integer | 消息ID | 主键、自增、索引 |
| session_id | Integer | 会话ID | 外键(chat_sessions.id) |
| role | String | 角色 | 'user'或'assistant' |
| content | Text | 消息内容 | 长文本 |
| created_at | DateTime | 创建时间 | 自动设置为当前时间 |

表定义：
```python
class ChatMessage(Base):
    """聊天消息模型"""
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("chat_sessions.id", ondelete="CASCADE"))
    role = Column(String)  # 'user' 或 'assistant'
    content = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # 关系
    session = relationship("ChatSession", back_populates="messages")
```

## 表关系说明

1. **一对多关系**：一个用户(User)可以有多个聊天会话(ChatSession)
   - 关系定义：`User.chat_sessions` (通过backref实现)
   - 外键约束：`ChatSession.user_id` 引用 `User.id`，级联删除

2. **一对多关系**：一个聊天会话(ChatSession)可以有多个聊天消息(ChatMessage)
   - 关系定义：`ChatSession.messages` 和 `ChatMessage.session`
   - 外键约束：`ChatMessage.session_id` 引用 `ChatSession.id`，级联删除

## 数据库迁移管理（可选扩展）

对于更复杂的项目，可以考虑使用Alembic进行数据库迁移管理：

1. 安装Alembic：
```bash
pip install alembic
```

2. 初始化迁移环境：
```bash
alembic init migrations
```

3. 配置`alembic.ini`和`migrations/env.py`

4. 创建迁移脚本：
```bash
alembic revision --autogenerate -m "Initial migration"
```

5. 应用迁移：
```bash
alembic upgrade head
```

## 数据库备份（生产环境建议）

### SQLite备份

```bash
# 简单复制文件
cp chatapp.db chatapp.db.backup

# 使用SQLite命令
sqlite3 chatapp.db ".backup 'chatapp.db.backup'"
```

### 恢复备份

```bash
# 简单复制文件
cp chatapp.db.backup chatapp.db

# 使用SQLite命令
sqlite3 chatapp.db ".restore 'chatapp.db.backup'"
```

## 数据库性能优化建议

1. **保持适当的索引**：我们已在主键、外键和常用查询字段上建立索引

2. **定期VACUUM**：对于SQLite，可以定期执行VACUUM操作以优化数据库文件大小
```sql
VACUUM;
```

3. **监控查询性能**：对于生产环境，可以考虑使用工具监控慢查询

4. **连接池管理**：对于高负载应用，可以配置适当的数据库连接池

5. **分页查询**：处理大量数据时使用分页查询，避免一次加载过多数据 