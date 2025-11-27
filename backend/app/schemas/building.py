from pydantic import BaseModel
from typing import List, Optional
from .room import RoomResponse

class BuildingBase(BaseModel):
    name: str
    address: Optional[str] = None

class BuildingCreate(BuildingBase):
    pass

class BuildingResponse(BuildingBase):
    id: int
    rooms: List[RoomResponse] = []

    class Config:
        orm_mode = True