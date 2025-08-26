from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from config import settings

# 创建 Engine
engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True, future=True)

# SessionLocal 用于 FastAPI 的依赖注入
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base 类，用于声明 ORM 模型
Base = declarative_base()


# FastAPI 依赖 - 获取数据库会话
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()