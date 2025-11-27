from datetime import date, timedelta
from sqlalchemy.orm import Session
from app.models import Lease, Bill, Room
from app.schemas import LeaseCreate
from dateutil.relativedelta import relativedelta

# 水电费单价
WATER_UNIT_PRICE = 5.0  # 5元/吨
ELEC_UNIT_PRICE = 1.0   # 1元/度

def generate_bills_for_lease(db: Session, lease: Lease):
    """为合同生成所有分期账单"""
    start_date = lease.start_date
    end_date = lease.end_date
    rent_amount = lease.rent_amount

    # 计算租期总月数
    delta = relativedelta(end_date, start_date)
    total_months = delta.years * 12 + delta.months

    if total_months <= 0:
        return []

    bills = []
    current_date = start_date

    for month in range(total_months):
        # 生成账单周期（YYYY-MM）
        period = f"{current_date.year}-{current_date.month:02d}"

        # 设置缴费截止日（每月15号）
        due_date = current_date.replace(day=15)

        # 如果截止日已过，设置为下个月15号
        if due_date < date.today():
            if current_date.month == 12:
                due_date = due_date.replace(year=current_date.year + 1, month=1)
            else:
                due_date = due_date.replace(month=current_date.month + 1)

        bill = Bill(
            lease_id=lease.id,
            period=period,
            rent_fee=rent_amount,
            water_fee=0.0,
            elec_fee=0.0,
            total_amount=rent_amount,
            status="Pending",
            due_date=due_date
        )
        bills.append(bill)

        # 计算下个月的日期
        if current_date.month == 12:
            current_date = current_date.replace(year=current_date.year + 1, month=1)
        else:
            current_date = current_date.replace(month=current_date.month + 1)

    db.add_all(bills)
    return bills

def update_bill_with_meter_reading(db: Session, bill_id: int, current_water: float, current_elec: float):
    """更新账单的水电读数并计算费用"""
    bill = db.query(Bill).filter(Bill.id == bill_id).first()
    if not bill:
        return None

    room = db.query(Room).filter(Room.id == bill.lease.room_id).first()
    if not room:
        return None

    # 验证读数合理性
    if current_water < room.last_water_reading:
        raise ValueError("当前水表读数不能小于上次读数")
    if current_elec < room.last_elec_reading:
        raise ValueError("当前电表读数不能小于上次读数")

    # 计算水电费
    water_usage = current_water - room.last_water_reading
    elec_usage = current_elec - room.last_elec_reading

    water_fee = water_usage * WATER_UNIT_PRICE
    elec_fee = elec_usage * ELEC_UNIT_PRICE

    # 更新账单
    bill.water_fee = water_fee
    bill.elec_fee = elec_fee
    bill.total_amount = bill.rent_fee + water_fee + elec_fee

    # 更新房间的最后读数
    room.last_water_reading = current_water
    room.last_elec_reading = current_elec

    db.commit()
    db.refresh(bill)
    return bill

def pay_bill(db: Session, bill_id: int):
    """支付账单"""
    bill = db.query(Bill).filter(Bill.id == bill_id).first()
    if not bill:
        return None

    bill.status = "Paid"
    db.commit()
    db.refresh(bill)
    return bill

def get_bill_status(bill: Bill):
    """获取账单状态（包含逾期判断）"""
    if bill.status == "Paid":
        return "Paid"
    elif date.today() > bill.due_date:
        return "Overdue"
    else:
        return "Pending"