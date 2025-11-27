from sqlalchemy import Column, Integer, String, ForeignKey, Float
from sqlalchemy.orm import relationship
from app.database import Base

class Room(Base):
    __tablename__ = "rooms"

    id = Column(Integer, primary_key=True, index=True)
    building_id = Column(Integer, ForeignKey("buildings.id"))
    room_number = Column(String, index=True)
    area = Column(Float)
    status = Column(String, index=True)  # Vacant, Occupied, Maintenance
    last_water_reading = Column(Float, default=0.0)
    last_elec_reading = Column(Float, default=0.0)

    building = relationship("Building", back_populates="rooms")
    lease = relationship("Lease", back_populates="room", uselist=False)
