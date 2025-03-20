# ChatGPT 克隆 API

基于LangChain和OpenAI API的聊天网站后端。

## 功能

- 用户认证（注册和登录）
- 基于OpenAI API的聊天功能
- 聊天历史管理
- 会话管理

## 技术栈

- FastAPI
- SQLite
- LangChain
- OpenAI API
- SQLAlchemy
- Pydantic

## 如何开始

1. 克隆此仓库
2. 安装依赖项:

```bash
pip install -r requirements.txt
```

3. 创建`.env`文件 (参考 .env.example):

```bash
cp .env.example .env
```

4. 在`.env`文件中设置您的OpenAI API密钥和其他配置

5. 运行应用程序:

```bash
python run.py
```

应用程序将在 http://localhost:8000 上运行。

## API文档

启动应用程序后，您可以在 http://localhost:8000/docs 访问Swagger文档。

## 项目结构

```
server/
├── app/
│   ├── api/                 # API路由
│   ├── core/                # 核心配置
│   ├── db/                  # 数据库配置
│   ├── models/              # 数据库模型
│   ├── schemas/             # Pydantic模式
│   ├── services/            # 业务逻辑服务
│   └── main.py              # 应用程序入口点
├── .env.example             # 环境变量示例
├── requirements.txt         # 依赖项
└── run.py                   # 启动脚本
```

## 扩展

该项目设计为易于扩展:

1. 添加新的数据模型到 `app/models/`
2. 添加新的Pydantic模式到 `app/schemas/`
3. 创建新的服务到 `app/services/`
4. 添加新的API路由到 `app/api/` 