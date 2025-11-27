from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session, joinedload
from app import models, schemas
from app.database import get_db
from app.services.bill_service import update_bill_with_meter_reading, get_bill_status

router = APIRouter()

def get_landlord_role(x_role: str = Header(None)):
    """验证房东身份"""
    if x_role != "landlord":
        raise HTTPException(status_code=403, detail="Forbidden: Landlord access required")
    return x_role

@router.get("/bills", response_model=list[schemas.BillResponse])
def get_bills(
    status: str = None,
    building_id: int = None,
    db: Session = Depends(get_db),
    x_role: str = Depends(get_landlord_role)
):
    """获取账单列表（房东权限）"""
    query = db.query(models.Bill).options(
        joinedload(models.Bill.lease).joinedload(models.Lease.room),
        joinedload(models.Bill.lease).joinedload(models.Lease.tenant)
    )

    if status:
        query = query.filter(models.Bill.status == status)

    if building_id:
        query = query.join(models.Lease).join(models.Room).filter(models.Room.building_id == building_id)

    bills = query.all()

    # 添加状态信息
    for bill in bills:
        bill.status = get_bill_status(bill)

    return bills

@router.get("/bills/{bill_id}", response_model=schemas.BillResponse)
def get_bill(bill_id: int, db: Session = Depends(get_db), x_role: str = Depends(get_landlord_role)):
    """获取单个账单（房东权限）"""
    bill = db.query(models.Bill).options(
        joinedload(models.Bill.lease).joinedload(models.Lease.room),
        joinedload(models.Bill.lease).joinedload(models.Lease.tenant)
    ).filter(models.Bill.id == bill_id).first()
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")

    bill.status = get_bill_status(bill)
    return bill

@router.post("/bills/{bill_id}/meter-reading", response_model=schemas.BillResponse)
def add_meter_reading(
    bill_id: int,
    meter_reading: schemas.MeterReadingInput,
    db: Session = Depends(get_db),
    x_role: str = Depends(get_landlord_role)
):
    """为账单添加水电表读数（房东权限）"""
    try:
        updated_bill = update_bill_with_meter_reading(
            db,
            bill_id,
            meter_reading.current_water_reading,
            meter_reading.current_elec_reading
        )
        if not updated_bill:
            raise HTTPException(status_code=404, detail="Bill not found")

        updated_bill.status = get_bill_status(updated_bill)
        return updated_bill
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))