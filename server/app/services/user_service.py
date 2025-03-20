from typing import Optional
from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate
from app.core.security import get_password_hash, verify_password


class UserService:
    """用户服务"""
    
    def get_by_email(self, db: Session, email: str) -> Optional[User]:
        """通过邮箱获取用户"""
        return db.query(User).filter(User.email == email).first()
    
    def get_by_username(self, db: Session, username: str) -> Optional[User]:
        """通过用户名获取用户"""
        return db.query(User).filter(User.username == username).first()
    
    def get(self, db: Session, user_id: int) -> Optional[User]:
        """通过ID获取用户"""
        return db.query(User).filter(User.id == user_id).first()
    
    def create(self, db: Session, obj_in: UserCreate) -> User:
        """创建用户"""
        db_obj = User(
            username=obj_in.username,
            email=obj_in.email,
            hashed_password=get_password_hash(obj_in.password),
            is_active=True,
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def update(self, db: Session, db_obj: User, obj_in: UserUpdate) -> User:
        """更新用户"""
        update_data = obj_in.model_dump(exclude_unset=True)
        if update_data.get("password"):
            hashed_password = get_password_hash(update_data["password"])
            del update_data["password"]
            update_data["hashed_password"] = hashed_password
        
        for field, value in update_data.items():
            setattr(db_obj, field, value)
            
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def authenticate(self, db: Session, username: str, password: str) -> Optional[User]:
        """验证用户"""
        user = self.get_by_username(db, username=username)
        if not user:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        return user
    
    def is_active(self, user: User) -> bool:
        """检查用户是否激活"""
        return user.is_active


# 单例模式
user_service = UserService() 