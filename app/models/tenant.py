"""
租户表，用于管理租户信息
"""
from sqlalchemy import Column, Integer, String, DateTime, Boolean, BigInteger
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import ENUM, JSONB
from app.core.pq_db import Base


class Tenant(Base):
    __tablename__ = "tenants"
    __table_args__ = {'schema': 'public'}  # 租户表在公共schema中

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)
    domain = Column(String(255))
    avatar_url = Column(String(255))
    
    # 使用枚举类型
    status = Column(ENUM('pending', 'active', 'suspended', 'inactive', name='tenant_status'), 
                   default='pending', nullable=False)
    plan_type = Column(ENUM('basic', 'pro', 'enterprise', name='tenant_plan_type'), 
                      default='basic', nullable=False)
    
    max_users = Column(Integer, default=10)
    max_storage = Column(BigInteger, default=1073741824)  # 1GB in bytes
    settings = Column(JSONB)
    schema_name = Column(String(63), unique=True, nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
