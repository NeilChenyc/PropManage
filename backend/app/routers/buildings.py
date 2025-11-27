from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import models, schemas
from app.database import get_db

router = APIRouter()

@router.get("/buildings", response_model=list[schemas.BuildingResponse])
def get_buildings(db: Session = Depends(get_db)):
    """获取所有楼宇及旗下房间"""
    buildings = db.query(models.Building).all()
    return buildings

@router.get("/buildings/{building_id}", response_model=schemas.BuildingResponse)
def get_building(building_id: int, db: Session = Depends(get_db)):
    """获取单个楼宇及旗下房间"""
    building = db.query(models.Building).filter(models.Building.id == building_id).first()
    if not building:
        raise HTTPException(status_code=404, detail="Building not found")
    return building

@router.post("/buildings", response_model=schemas.BuildingResponse)
def create_building(building: schemas.BuildingCreate, db: Session = Depends(get_db)):
    """创建新楼宇"""
    db_building = models.Building(**building.dict())
    db.add(db_building)
    db.commit()
    db.refresh(db_building)
    return db_building