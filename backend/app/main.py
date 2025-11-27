from fastapi import FastAPI, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from app import models, schemas
from app.database import engine, get_db
from app.routers import buildings, tenants, leases, bills, my

# 创建数据库表
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="PropManage Lite API", version="1.0.0")

# 配置CORS
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 包含路由
app.include_router(buildings.router, prefix="/api", tags=["buildings"])
app.include_router(tenants.router, prefix="/api", tags=["tenants"])
app.include_router(leases.router, prefix="/api", tags=["leases"])
app.include_router(bills.router, prefix="/api", tags=["bills"])
app.include_router(my.router, prefix="/api", tags=["my"])

# 根路径
@app.get("/")
def read_root():
    return {"message": "Welcome to PropManage Lite API"}

# 健康检查
@app.get("/health")
def health_check():
    return {"status": "healthy"}