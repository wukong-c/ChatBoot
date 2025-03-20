from typing import List, Optional
from sqlalchemy.orm import Session

from app.models.chat import ChatSession, ChatMessage
from app.schemas.chat import ChatSessionCreate, ChatSessionUpdate


class ChatSessionService:
    """聊天会话服务"""
    
    def get(self, db: Session, session_id: int) -> Optional[ChatSession]:
        """获取聊天会话"""
        return db.query(ChatSession).filter(ChatSession.id == session_id).first()
    
    def get_by_user(self, db: Session, user_id: int) -> List[ChatSession]:
        """获取用户的所有聊天会话"""
        return (
            db.query(ChatSession)
            .filter(ChatSession.user_id == user_id)
            .order_by(ChatSession.updated_at.desc())
            .all()
        )
    
    def create(self, db: Session, obj_in: ChatSessionCreate, user_id: int) -> ChatSession:
        """创建聊天会话"""
        db_obj = ChatSession(
            **obj_in.model_dump(),
            user_id=user_id,
            is_active=True
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def update(self, db: Session, db_obj: ChatSession, obj_in: ChatSessionUpdate) -> ChatSession:
        """更新聊天会话"""
        update_data = obj_in.model_dump(exclude_unset=True)
        
        for field, value in update_data.items():
            setattr(db_obj, field, value)
            
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def delete(self, db: Session, session_id: int, user_id: int) -> bool:
        """删除聊天会话"""
        session = (
            db.query(ChatSession)
            .filter(ChatSession.id == session_id, ChatSession.user_id == user_id)
            .first()
        )
        if not session:
            return False
        
        # 删除关联的消息
        db.query(ChatMessage).filter(ChatMessage.session_id == session_id).delete()
        
        # 删除会话
        db.delete(session)
        db.commit()
        return True
    
    def get_with_messages(self, db: Session, session_id: int, user_id: int) -> Optional[ChatSession]:
        """获取聊天会话及其消息"""
        return (
            db.query(ChatSession)
            .filter(ChatSession.id == session_id, ChatSession.user_id == user_id)
            .first()
        )


# 单例模式
chat_session_service = ChatSessionService() 