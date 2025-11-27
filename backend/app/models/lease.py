from sqlalchemy import Column, Integer, ForeignKey, Date, Float, String
from sqlalchemy.orm import relationship
from app.database import Base

class Lease(Base):
    __tablename__ = "leases"

    id = Column(Integer, primary_key=True, index=True)
    room_id = Column(Integer, ForeignKey("rooms.id"))
    tenant_id = Column(Integer, ForeignKey("tenants.id"))
    start_date = Column(Date)
    end_date = Column(Date)
    rent_amount = Column(Float)
    deposit = Column(Float)
    status = Column(String, index=True)  # Active, Terminated

    room = relationship("Room", back_populates="lease")
    tenant = relationship("Tenant", back_populates="leases")
    bills = relationship("Bill", back_populates="lease", cascade="all, delete-orphan")