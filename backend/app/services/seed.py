from datetime import date, timedelta
from sqlalchemy.orm import Session
from app.models import Building, Room, Tenant, Lease, Bill
from app.database import Base, engine

def create_seed_data(db: Session):
    # 创建楼宇
    building_a = Building(name="Building A", address="123 Main Street")
    building_b = Building(name="Building B", address="456 Oak Avenue")
    db.add_all([building_a, building_b])
    db.commit()

    # 创建房间
    rooms = [
        Room(building_id=building_a.id, room_number="A-101", area=50.0, status="Vacant", last_water_reading=100.0, last_elec_reading=200.0),
        Room(building_id=building_a.id, room_number="A-102", area=60.0, status="Occupied", last_water_reading=150.0, last_elec_reading=250.0),
        Room(building_id=building_a.id, room_number="A-103", area=55.0, status="Vacant", last_water_reading=120.0, last_elec_reading=220.0),
        Room(building_id=building_b.id, room_number="B-201", area=70.0, status="Vacant", last_water_reading=90.0, last_elec_reading=180.0),
        Room(building_id=building_b.id, room_number="B-202", area=65.0, status="Vacant", last_water_reading=110.0, last_elec_reading=210.0),
        Room(building_id=building_b.id, room_number="B-203", area=58.0, status="Vacant", last_water_reading=130.0, last_elec_reading=230.0),
    ]
    db.add_all(rooms)
    db.commit()

    # 创建租客
    tenants = [
        Tenant(name="User1", phone="13800138001"),
        Tenant(name="User2", phone="13800138002"),
        Tenant(name="User3", phone="13800138003"),
    ]
    db.add_all(tenants)
    db.commit()

    # 创建合同和账单（User1租A-102，12个月）
    start_date = date.today().replace(day=1)
    end_date = start_date.replace(year=start_date.year + 1)

    lease = Lease(
        room_id=rooms[1].id,
        tenant_id=tenants[0].id,
        start_date=start_date,
        end_date=end_date,
        rent_amount=3000.0,
        deposit=6000.0,
        status="Active"
    )
    db.add(lease)
    db.commit()

    # 生成12期账单
    bills = []
    current_date = start_date
    for month in range(12):
        period = f"{current_date.year}-{current_date.month:02d}"
        due_date = current_date.replace(day=15)  # 每月15号为缴费截止日

        bill = Bill(
            lease_id=lease.id,
            period=period,
            rent_fee=3000.0,
            water_fee=0.0,
            elec_fee=0.0,
            total_amount=3000.0,
            status="Pending",
            due_date=due_date
        )
        bills.append(bill)

        # 下个月
        if current_date.month == 12:
            current_date = current_date.replace(year=current_date.year + 1, month=1)
        else:
            current_date = current_date.replace(month=current_date.month + 1)

    db.add_all(bills)
    db.commit()

    print("Seed data created successfully!")

def init_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    from app.database import SessionLocal
    db = SessionLocal()
    try:
        create_seed_data(db)
    finally:
        db.close()

if __name__ == "__main__":
    init_db()