from fastapi import FastAPI
from app.api.tenant import tenant_router

app = FastAPI(
    title="多租户平台API",
    description="基于PostgreSQL Schema隔离的多租户平台",
    version="1.0.0"
)

# 注册路由
app.include_router(tenant_router, prefix="/api/v1")

@app.get("/")
def read_root():
    return {
        "message": "多租户平台API服务",
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}