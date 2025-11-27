from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session, joinedload
from app import models, schemas
from app.database import get_db
from app.services.bill_service import pay_bill, get_bill_status

router = APIRouter()

def get_tenant_id(x_tenant_id: str = Header(None)):
    """从请求头获取租客ID"""
    if not x_tenant_id:
        raise HTTPException(status_code=400, detail="X-Tenant-Id header is required")
    try:
        return int(x_tenant_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="X-Tenant-Id must be an integer")

@router.get("/my/lease", response_model=schemas.LeaseResponse)
def get_my_lease(tenant_id: int = Depends(get_tenant_id), db: Session = Depends(get_db)):
    """获取当前租客的有效合同"""
    lease = db.query(models.Lease).options(
        joinedload(models.Lease.room),
        joinedload(models.Lease.bills)
    ).filter(
        models.Lease.tenant_id == tenant_id,
        models.Lease.status == "Active"
    ).first()
    if not lease:
        raise HTTPException(status_code=404, detail="No active lease found")
    return lease

@router.get("/my/bills", response_model=list[schemas.BillResponse])
def get_my_bills(tenant_id: int = Depends(get_tenant_id), db: Session = Depends(get_db)):
    """获取当前租客的账单"""
    bills = db.query(models.Bill).join(models.Lease).filter(
        models.Lease.tenant_id == tenant_id
    ).all()

    # 添加状态信息
    for bill in bills:
        bill.status = get_bill_status(bill)

    return bills

@router.post("/my/bills/{bill_id}/pay", response_model=schemas.BillResponse)
def pay_my_bill(bill_id: int, tenant_id: int = Depends(get_tenant_id), db: Session = Depends(get_db)):
    """支付账单（租客权限）"""
    # 验证账单是否属于该租客
    bill = db.query(models.Bill).join(models.Lease).filter(
        models.Bill.id == bill_id,
        models.Lease.tenant_id == tenant_id
    ).first()

    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found or access denied")

    updated_bill = pay_bill(db, bill_id)
    if not updated_bill:
        raise HTTPException(status_code=404, detail="Bill not found")

    updated_bill.status = get_bill_status(updated_bill)
    return updated_bill