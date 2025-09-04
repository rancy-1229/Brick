"""
PostgreSQL数据库连接和会话管理
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config import settings

# 创建 Engine
engine = create_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,  # 在调试模式下显示SQL语句
    pool_pre_ping=True,   # 连接池预检查
    pool_recycle=3600,    # 连接回收时间（秒）
)

# 创建 SessionLocal
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 创建 Base 类
Base = declarative_base()

def get_db():
    """
    获取数据库会话
    
    Yields:
        Session: 数据库会话对象
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()