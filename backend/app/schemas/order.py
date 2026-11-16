from datetime import datetime
from pydantic import BaseModel
from typing import List, Optional
from app.schemas.product import ProductOut
from app.schemas.user import UserOut

class OrderItemCreate(BaseModel):
    product_id: int
    quantity: float

class OrderItemOut(BaseModel):
    id: int
    product_id: int
    quantity: float
    unit_price: float
    product: Optional[ProductOut] = None

    class Config:
        from_attributes = True

class OrderCreate(BaseModel):
    items: List[OrderItemCreate]
    shipping_address: str
    contact_number: str
    payment_method: str = "Cash on Delivery"

class OrderStatusUpdate(BaseModel):
    status: str # "Pending", "Shipped", "Delivered", "Cancelled"

class OrderOut(BaseModel):
    id: int
    user_id: int
    total_amount: float
    shipping_address: str
    contact_number: Optional[str] = None
    payment_method: str
    status: str
    created_at: datetime
    items: List[OrderItemOut] = []
    user: Optional[UserOut] = None

    class Config:
        from_attributes = True
