from pydantic import BaseModel
from datetime import date
from typing import List
from .bill import BillResponse

class LeaseBase(BaseModel):
    room_id: int
    tenant_id: int
    start_date: date
    end_date: date
    rent_amount: float
    deposit: float

class LeaseCreate(LeaseBase):
    pass

class LeaseResponse(LeaseBase):
    id: int
    status: str
    bills: List[BillResponse] = []

    class Config:
        orm_mode = True