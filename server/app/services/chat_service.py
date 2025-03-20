from typing import List, Dict, Any, Optional, AsyncGenerator
from langchain_openai import ChatOpenAI
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from sqlalchemy.orm import Session
from datetime import datetime

from app.core.config import settings
from app.models.chat import ChatSession, ChatMessage
from app.schemas.chat import ChatMessageCreate


class ChatService:
    """聊天服务"""

    def __init__(self):
        """初始化聊天服务"""
        self.llm = ChatOpenAI(
            api_key=settings.OPENAI_API_KEY,
            base_url=settings.OPENAI_BASE_URL,
            model_name=settings.OPENAI_MODEL_NAME,
            temperature=0.7,
            streaming=True
        )
        
    def get_chat_history(self, db: Session, session_id: int) -> List[Any]:
        """获取聊天历史记录"""
        messages = (
            db.query(ChatMessage)
            .filter(ChatMessage.session_id == session_id)
            .order_by(ChatMessage.created_at)
            .all()
        )
        
        history = []
        for message in messages:
            if message.role == "user":
                history.append(HumanMessage(content=message.content))
            elif message.role == "assistant":
                history.append(AIMessage(content=message.content))
            # 可以添加系统消息处理
            
        return history
    
    def prepare_chat(
        self, 
        db: Session, 
        user_id: int, 
        message: str, 
        session_id: Optional[int] = None,
        new_session_title: Optional[str] = None
    ) -> Dict[str, Any]:
        """准备聊天会话和消息"""
        # 如果没有会话ID，创建新的会话
        if not session_id:
            # 使用用户消息作为默认标题
            title = new_session_title or message[:20] + "..."
            chat_session = ChatSession(title=title, user_id=user_id)
            db.add(chat_session)
            db.commit()
            db.refresh(chat_session)
            session_id = chat_session.id
        else:
            # 验证会话存在并属于当前用户
            chat_session = (
                db.query(ChatSession)
                .filter(ChatSession.id == session_id, ChatSession.user_id == user_id)
                .first()
            )
            if not chat_session:
                raise ValueError("聊天会话不存在或不属于当前用户")
        
        # 创建用户消息
        user_message = ChatMessage(
            session_id=session_id,
            role="user",
            content=message
        )
        db.add(user_message)
        db.commit()
        db.refresh(user_message)
        
        # 获取聊天历史
        history = self.get_chat_history(db, session_id)
        
        # 添加系统消息
        system_message = SystemMessage(content="你是一个有用的AI助手。")
        
        # 构建消息历史
        messages = [system_message] + history
        
        return {
            "session_id": session_id,
            "messages": messages
        }
        
    def send_message(
        self, 
        db: Session, 
        user_id: int, 
        message: str, 
        session_id: Optional[int] = None,
        new_session_title: Optional[str] = None
    ) -> Dict[str, Any]:
        """发送消息并获取响应（非流式）"""
        chat_data = self.prepare_chat(
            db=db,
            user_id=user_id,
            message=message,
            session_id=session_id,
            new_session_title=new_session_title
        )
        
        session_id = chat_data["session_id"]
        messages = chat_data["messages"]
        
        # 获取AI响应
        response = self.llm.invoke(messages)
        
        # 保存AI响应
        assistant_message = ChatMessage(
            session_id=session_id,
            role="assistant",
            content=response.content
        )
        db.add(assistant_message)
        db.commit()
        db.refresh(assistant_message)
        
        return {
            "session_id": session_id,
            "message": assistant_message
        }
    
    async def send_message_streaming(
        self, 
        db: Session, 
        user_id: int, 
        message: str, 
        session_id: Optional[int] = None,
        new_session_title: Optional[str] = None
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """发送消息并获取流式响应"""
        chat_data = self.prepare_chat(
            db=db,
            user_id=user_id,
            message=message,
            session_id=session_id,
            new_session_title=new_session_title
        )
        
        session_id = chat_data["session_id"]
        messages = chat_data["messages"]
        
        # 创建一个空的助手消息，用于后续更新
        assistant_message = ChatMessage(
            session_id=session_id,
            role="assistant",
            content=""
        )
        db.add(assistant_message)
        db.commit()
        db.refresh(assistant_message)
        
        # 初始消息
        yield {
            "session_id": session_id,
            "message": {
                "id": assistant_message.id,
                "role": "assistant",
                "content": "",
                "session_id": session_id,
                "created_at": assistant_message.created_at.isoformat()
            },
            "done": False
        }
        
        # 获取流式响应
        full_response = ""
        async for chunk in self.llm.astream(messages):
            if hasattr(chunk, 'content') and chunk.content:
                content_chunk = chunk.content
                full_response += content_chunk
                
                # 发送块响应
                yield {
                    "session_id": session_id,
                    "message": {
                        "id": assistant_message.id,
                        "role": "assistant",
                        "content": content_chunk,
                        "session_id": session_id,
                        "created_at": assistant_message.created_at.isoformat()
                    },
                    "done": False
                }
        
        # 更新数据库中的完整响应
        assistant_message.content = full_response
        db.add(assistant_message)
        db.commit()
        
        # 发送完成信号
        yield {
            "session_id": session_id,
            "message": {
                "id": assistant_message.id,
                "role": "assistant",
                "content": full_response,
                "session_id": session_id,
                "created_at": assistant_message.created_at.isoformat()
            },
            "done": True
        }


# 单例模式
chat_service = ChatService() 