from sqlalchemy import Column, Integer, ForeignKey, String, Float, Date
from sqlalchemy.orm import relationship
from app.database import Base

class Bill(Base):
    __tablename__ = "bills"

    id = Column(Integer, primary_key=True, index=True)
    lease_id = Column(Integer, ForeignKey("leases.id"))
    period = Column(String, index=True)  # e.g., "2023-10"
    rent_fee = Column(Float)
    water_fee = Column(Float, default=0.0)
    elec_fee = Column(Float, default=0.0)
    total_amount = Column(Float)
    status = Column(String, index=True)  # Pending, Paid
    due_date = Column(Date)

    lease = relationship("Lease", back_populates="bills")

    @property
    def room(self):
        return self.lease.room if self.lease else None

    @property
    def tenant(self):
        return self.lease.tenant if self.lease else None