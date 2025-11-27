from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import models, schemas
from app.database import get_db

router = APIRouter()

@router.get("/tenants", response_model=list[schemas.TenantResponse])
def get_tenants(db: Session = Depends(get_db)):
    """获取所有租客"""
    tenants = db.query(models.Tenant).all()
    return tenants

@router.get("/tenants/{tenant_id}", response_model=schemas.TenantResponse)
def get_tenant(tenant_id: int, db: Session = Depends(get_db)):
    """获取单个租客"""
    tenant = db.query(models.Tenant).filter(models.Tenant.id == tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return tenant

@router.post("/tenants", response_model=schemas.TenantResponse)
def create_tenant(tenant: schemas.TenantBase, db: Session = Depends(get_db)):
    """创建新租客"""
    db_tenant = models.Tenant(**tenant.dict())
    db.add(db_tenant)
    db.commit()
    db.refresh(db_tenant)
    return db_tenant