from pydantic import BaseModel
from datetime import date
from typing import Optional

class BillBase(BaseModel):
    period: str
    rent_fee: float
    water_fee: float = 0.0
    elec_fee: float = 0.0
    total_amount: float
    status: str
    due_date: date

class BillResponse(BillBase):
    id: int
    lease_id: int

    class Config:
        orm_mode = True

class MeterReadingInput(BaseModel):
    current_water_reading: float
    current_elec_reading: float

class BillPayInput(BaseModel):
    bill_id: int