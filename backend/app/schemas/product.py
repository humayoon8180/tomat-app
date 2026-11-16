from datetime import datetime
from pydantic import BaseModel, computed_field
from typing import Optional
from app.core.config import settings

class ProductBase(BaseModel):
    title: str
    variety: str
    description: Optional[str] = None
    price_per_unit: float
    stock_quantity: float
    image_url: Optional[str] = None
    is_active: bool = True

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    title: Optional[str] = None
    variety: Optional[str] = None
    description: Optional[str] = None
    price_per_unit: Optional[float] = None
    stock_quantity: Optional[float] = None
    image_url: Optional[str] = None
    is_active: Optional[bool] = None

class ProductOut(ProductBase):
    id: int
    created_at: datetime

    @computed_field
    def is_low_stock(self) -> bool:
        return self.stock_quantity < settings.LOW_STOCK_THRESHOLD

    class Config:
        from_attributes = True
