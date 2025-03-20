# ChatGPT 克隆项目 - 待办事项

## 环境配置
- [ ] 创建一个 `.env` 文件（复制 `.env.example` 并填写您自己的 OpenAI API 密钥）
- [ ] 设置一个安全的 SECRET_KEY（可以使用 `openssl rand -hex 32` 命令生成）
- [ ] 按需设置 OPENAI_BASE_URL（默认为 https://api.openai.com/v1，如使用非官方API或镜像时需修改）
- [ ] 安装所有依赖项：`pip install -r requirements.txt`
- [ ] 注意：本项目使用LangChain 0.3.x版本，这是最新的主要版本，如果遇到任何导入或API兼容性问题，请参考LangChain官方文档

## 数据库准备
- [ ] 确认SQLite已安装（大多数Python环境已预装）
- [ ] 首次运行应用时，数据库会自动创建（SQLite文件：`./chatapp.db`）
- [ ] 如需使用其他数据库（如PostgreSQL），在.env文件中修改DATABASE_URL
- [ ] （可选）设置数据库备份策略
- [ ] （可选）为生产环境安装Alembic进行数据库迁移管理：`pip install alembic`

## 部署步骤
- [ ] 启动应用程序：`python run.py` 或 `uvicorn app.main:app --reload`
- [ ] 访问 API 文档：http://localhost:8000/docs
- [ ] 测试基础健康检查：http://localhost:8000/
- [ ] 创建一个测试用户并验证登录功能
- [ ] 测试聊天功能和历史记录功能

## 前端开发
- [ ] 创建登录和注册页面
- [ ] 实现聊天界面
  - [ ] 创建新会话
  - [ ] 会话历史切换
  - [ ] 消息显示
  - [ ] 消息发送组件
- [ ] 实现用户设置页面
- [ ] 对接所有后端 API

## 功能扩展（可选）
- [ ] 添加流式响应支持（Streaming responses）
- [ ] 实现文件上传和处理功能
- [ ] 添加多语言支持
- [ ] 实现自定义系统提示模板
- [ ] 添加向量存储以支持知识库功能
- [ ] 实现用户角色和权限系统
- [ ] 添加会话导出功能（Markdown, PDF等）
- [ ] 实现主题切换（暗/亮模式）
- [ ] 添加数据库性能优化（如：定期VACUUM）

## 测试
- [ ] 编写单元测试
- [ ] 编写集成测试
- [ ] 进行性能测试
- [ ] 测试数据库备份和恢复

## 部署生产
- [ ] 设置生产环境配置
- [ ] 部署到云服务提供商（AWS, Azure, GCP等）
- [ ] 设置 HTTPS
- [ ] 配置数据库备份
- [ ] 设置监控和日志记录
- [ ] 实现数据库迁移策略（使用Alembic） 