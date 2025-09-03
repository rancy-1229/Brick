"""
租户表，用于管理租户信息
"""
from sqlalchemy import Column, Integer, String, DateTime, Boolean, BigInteger
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import ENUM, JSONB
from core.pq_db import Base


class Tenant(Base):
    __tablename__ = "tenants"
    __table_args__ = {'schema': 'public'}  # 租户表在公共schema中

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(String(50), unique=True, nullable=False, index=True,description='租户唯一标识')
    name = Column(String(100), nullable=False,description='租户名称')
    domain = Column(String(255),description='租户域名')
    avatar_url = Column(String(255),description='租户头像')
    
    # 使用枚举类型
    status = Column(ENUM('active', 'suspended', 'inactive', name='tenant_status'), 
                   default='active', nullable=False,description='租户状态')
                   default='active', nullable=False)
    plan_type = Column(ENUM('basic', 'pro', 'enterprise', name='tenant_plan_type'), 
                      default='basic', nullable=False,description='租户套餐类型')
    
    max_users = Column(Integer, default=10,description='最大用户数')
    max_storage = Column(BigInteger, default=1073741824,description='最大存储空间')  # 1GB in bytes
    settings = Column(JSONB,description='租户配置')
    schema_name = Column(String(63), unique=True, nullable=False, index=True,description='租户schema名称')
    created_at = Column(DateTime(timezone=True), server_default=func.now(),description='创建时间')
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(),description='更新时间')
