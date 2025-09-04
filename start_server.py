"""
启动FastAPI服务
"""
import uvicorn
import os
import sys

# 添加项目根目录到Python路径
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    print("🚀 启动多租户平台API服务...")
    print("📖 API文档: http://localhost:8000/docs")
    print("📖 详细文档: http://localhost:8000/redoc")
    print("🔍 健康检查: http://localhost:8000/health")
    print("⏹️  按 Ctrl+C 停止服务\n")
    
    # 启动服务
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
