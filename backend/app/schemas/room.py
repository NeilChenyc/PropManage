from pydantic import BaseModel
from typing import Optional

class RoomBase(BaseModel):
    room_number: str
    area: Optional[float] = None
    status: Optional[str] = "Vacant"
    last_water_reading: Optional[float] = 0.0
    last_elec_reading: Optional[float] = 0.0

class RoomCreate(RoomBase):
    building_id: int

class RoomResponse(RoomBase):
    id: int
    building_id: int

    class Config:
        orm_mode = True

class RoomStatusUpdate(BaseModel):
    status: str