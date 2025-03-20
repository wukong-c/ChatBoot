from pydantic import BaseModel
import os
from typing import Optional, List
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()


class Settings(BaseModel):
    """应用程序设置"""
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "ChatGPT Clone API"
    
    # 数据库
    DATABASE_URL: str = "sqlite:///./chatapp.db"
    
    # OpenAI
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    OPENAI_MODEL_NAME: str = os.getenv("OPENAI_MODEL_NAME", "gpt-3.5-turbo")
    OPENAI_BASE_URL: str = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1")
    
    # 安全
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-here")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "10080"))  # 7天
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = ["*"]
    

settings = Settings() 