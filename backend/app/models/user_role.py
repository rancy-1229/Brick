"""
用户角色关联表，用于管理用户角色关联信息
"""
from sqlalchemy import Column, Integer, DateTime, String
from sqlalchemy.sql import func
from app.core.pq_db import Base


class UserRole(Base):
    __tablename__ = "user_roles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False, index=True)
    role_id = Column(Integer, nullable=False, index=True)
    assigned_by = Column(Integer)  # 暂时不设置外键约束
    assigned_at = Column(DateTime(timezone=True), server_default=func.now())

    # 约束
    __table_args__ = (
        # 用户角色关联在租户schema内唯一
        {'schema': None}  # 动态设置schema
    )
