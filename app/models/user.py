"""
用户表，用于管理用户信息
"""

from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import ENUM
from core.pq_db import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(50), unique=True, nullable=False, index=True)
    username = Column(String(50), nullable=False)
    email = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100))
    phone = Column(String(20))
    avatar_url = Column(String(255))
    
    # 使用枚举类型
    status = Column(ENUM('active', 'inactive', 'suspended', name='user_status'), 
                   default='active', nullable=False)
    role = Column(ENUM('super_admin', 'admin', 'user', name='user_role'), 
                 default='user', nullable=False)
    
    last_login_at = Column(DateTime(timezone=True))
    email_verified_at = Column(DateTime(timezone=True))
    phone_verified_at = Column(DateTime(timezone=True))
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # 约束
    __table_args__ = (
        # 用户名和邮箱在租户schema内唯一
        {'schema': None}  # 动态设置schema
    )
