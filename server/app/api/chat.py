from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.services.chat_service import chat_service
from app.services.chat_session_service import chat_session_service
from app.db.base import get_db
from app.core.deps import get_current_active_user
from app.models.user import User
from app.schemas.chat import (
    ChatRequest,
    ChatResponse,
    ChatSession,
    ChatHistoryResponse,
    ChatSessionCreate,
    ChatSessionUpdate,
)
import json

router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
def chat(
    *,
    db: Session = Depends(get_db),
    chat_request: ChatRequest,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    发送聊天消息并获取响应（非流式）
    """
    try:
        response = chat_service.send_message(
            db=db,
            user_id=current_user.id,
            message=chat_request.message,
            session_id=chat_request.session_id,
            new_session_title=chat_request.new_session_title,
        )
        return response
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.post("/stream")
async def chat_stream_post(
    *,
    db: Session = Depends(get_db),
    chat_request: ChatRequest,
    current_user: User = Depends(get_current_active_user),
):
    """
    发送聊天消息并获取流式响应 (POST方法)
    """
    return await generate_stream_response(
        db=db,
        user_id=current_user.id,
        message=chat_request.message,
        session_id=chat_request.session_id,
        new_session_title=chat_request.new_session_title,
    )


@router.get("/stream")
async def chat_stream_get(
    *,
    db: Session = Depends(get_db),
    message: str = Query(..., description="用户消息"),
    session_id: Optional[int] = Query(None, description="会话ID"),
    new_session_title: Optional[str] = Query(None, description="新会话标题"),
    current_user: User = Depends(get_current_active_user),
):
    """
    发送聊天消息并获取流式响应 (GET方法)
    """
    return await generate_stream_response(
        db=db,
        user_id=current_user.id,
        message=message,
        session_id=session_id,
        new_session_title=new_session_title,
    )


async def generate_stream_response(
    *,
    db: Session,
    user_id: int,
    message: str,
    session_id: Optional[int] = None,
    new_session_title: Optional[str] = None,
):
    """
    生成流式响应的通用方法
    """
    try:
        async def generate():
            async for chunk in chat_service.send_message_streaming(
                db=db,
                user_id=user_id,
                message=message,
                session_id=session_id,
                new_session_title=new_session_title,
            ):
                yield f"data: {json.dumps(chunk)}\n\n"
            
            # 结束SSE流
            yield "data: [DONE]\n\n"
        
        return StreamingResponse(
            generate(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no",
                "Access-Control-Allow-Origin": "*",
            }
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.get("/sessions", response_model=ChatHistoryResponse)
def get_chat_sessions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    获取用户的所有聊天会话
    """
    sessions = chat_session_service.get_by_user(db=db, user_id=current_user.id)
    return {"sessions": sessions}


@router.get("/sessions/{session_id}", response_model=ChatSession)
def get_chat_session(
    *,
    db: Session = Depends(get_db),
    session_id: int,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    获取特定聊天会话及其消息
    """
    session = chat_session_service.get_with_messages(
        db=db, session_id=session_id, user_id=current_user.id
    )
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="聊天会话不存在",
        )
    return session


@router.post("/sessions", response_model=ChatSession)
def create_chat_session(
    *,
    db: Session = Depends(get_db),
    session_in: ChatSessionCreate,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    创建新的聊天会话
    """
    session = chat_session_service.create(
        db=db, obj_in=session_in, user_id=current_user.id
    )
    return session


@router.put("/sessions/{session_id}", response_model=ChatSession)
def update_chat_session(
    *,
    db: Session = Depends(get_db),
    session_id: int,
    session_in: ChatSessionUpdate,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    更新聊天会话
    """
    session = chat_session_service.get(db=db, session_id=session_id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="聊天会话不存在",
        )
    
    # 检查会话是否属于当前用户
    if session.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="无权访问此会话",
        )
    
    session = chat_session_service.update(
        db=db, db_obj=session, obj_in=session_in
    )
    return session


@router.delete("/sessions/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_chat_session(
    *,
    db: Session = Depends(get_db),
    session_id: int,
    current_user: User = Depends(get_current_active_user),
) -> None:
    """
    删除聊天会话
    """
    result = chat_session_service.delete(
        db=db, session_id=session_id, user_id=current_user.id
    )
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="聊天会话不存在或无权删除",
        ) 