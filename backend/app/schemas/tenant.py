from pydantic import BaseModel

class TenantBase(BaseModel):
    name: str
    phone: str

class TenantResponse(TenantBase):
    id: int

    class Config:
        orm_mode = True