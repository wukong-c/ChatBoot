from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime


class ChatMessageBase(BaseModel):
    role: str
    content: str


class ChatMessageCreate(ChatMessageBase):
    session_id: int


class ChatMessage(ChatMessageBase):
    id: int
    session_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ChatSessionBase(BaseModel):
    title: str


class ChatSessionCreate(ChatSessionBase):
    pass


class ChatSessionUpdate(BaseModel):
    title: Optional[str] = None
    is_active: Optional[bool] = None


class ChatSession(ChatSessionBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    is_active: bool
    messages: List[ChatMessage] = []

    model_config = ConfigDict(from_attributes=True)


class ChatRequest(BaseModel):
    session_id: Optional[int] = None
    message: str
    new_session_title: Optional[str] = None


class ChatResponse(BaseModel):
    session_id: int
    message: ChatMessage


class ChatHistoryResponse(BaseModel):
    sessions: List[ChatSession] 