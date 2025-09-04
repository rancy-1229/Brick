"""
租户邀请表,用于管理租户邀请信息
"""
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import ENUM
from app.core.pq_db import Base


class TenantInvitation(Base):
    __tablename__ = "tenant_invitations"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), nullable=False)
    role_id = Column(Integer)  # 暂时不设置外键约束
    token = Column(String(255), unique=True, nullable=False, index=True)
    
    # 使用枚举类型
    status = Column(ENUM('pending', 'accepted', 'expired', name='invitation_status'), 
                   default='pending', nullable=False)
    
    expires_at = Column(DateTime(timezone=True), nullable=False)
    invited_by = Column(Integer, nullable=False)  # 暂时不设置外键约束
    accepted_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # 约束
    __table_args__ = (
        # 邀请表在租户schema中
        {'schema': None}  # 动态设置schema
    )
