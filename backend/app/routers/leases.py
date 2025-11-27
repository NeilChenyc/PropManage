from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session, joinedload
from app import models, schemas
from app.database import get_db
from app.services.bill_service import generate_bills_for_lease

router = APIRouter()

def get_landlord_role(x_role: str = Header(None)):
    """验证房东身份"""
    if x_role != "landlord":
        raise HTTPException(status_code=403, detail="Forbidden: Landlord access required")
    return x_role

@router.get("/leases", response_model=list[schemas.LeaseResponse])
def get_leases(db: Session = Depends(get_db), x_role: str = Depends(get_landlord_role)):
    """获取所有合同（房东权限）"""
    leases = db.query(models.Lease).options(
        joinedload(models.Lease.room),
        joinedload(models.Lease.tenant),
        joinedload(models.Lease.bills)
    ).all()
    return leases

@router.get("/leases/{lease_id}", response_model=schemas.LeaseResponse)
def get_lease(lease_id: int, db: Session = Depends(get_db), x_role: str = Depends(get_landlord_role)):
    """获取单个合同（房东权限）"""
    lease = db.query(models.Lease).options(
        joinedload(models.Lease.room),
        joinedload(models.Lease.tenant),
        joinedload(models.Lease.bills)
    ).filter(models.Lease.id == lease_id).first()
    if not lease:
        raise HTTPException(status_code=404, detail="Lease not found")
    return lease

@router.post("/leases", response_model=schemas.LeaseResponse)
def create_lease(lease: schemas.LeaseCreate, db: Session = Depends(get_db), x_role: str = Depends(get_landlord_role)):
    """创建新合同并自动生成账单（房东权限）"""
    # 验证房间是否存在且为空置
    room = db.query(models.Room).filter(models.Room.id == lease.room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    if room.status != "Vacant":
        raise HTTPException(status_code=400, detail="Room is not vacant")

    # 验证租客是否存在
    tenant = db.query(models.Tenant).filter(models.Tenant.id == lease.tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")

    # 验证日期有效性
    if lease.end_date <= lease.start_date:
        raise HTTPException(status_code=400, detail="End date must be after start date")

    # 创建合同
    db_lease = models.Lease(**lease.dict(), status="Active")
    db.add(db_lease)
    db.commit()
    db.refresh(db_lease)

    # 生成账单
    generate_bills_for_lease(db, db_lease)

    # 更新房间状态为已租
    room.status = "Occupied"
    db.commit()

    db.refresh(db_lease)
    return db_lease