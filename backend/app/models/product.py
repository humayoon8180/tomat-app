"""
[OOP CONCEPT: Entity Modeling & Inventory State]
- Represents the 'Product' entity in the produce e-commerce domain.
- Encapsulates stock levels, pricing, variety classification, and active status.
- Linked to 'OrderItem' so each tomato product can be referenced across multiple orders.
"""
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, Float, Boolean, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base

class Product(Base):
    # Name of the table in MySQL
    __tablename__ = "products"

    # [Database Fields / Attributes]
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(150), nullable=False, index=True)
    variety = Column(String(100), nullable=False) # e.g. Cherry, Roma, Beefsteak, Heirloom
    description = Column(Text, nullable=True)
    price_per_unit = Column(Float, nullable=False) # Unit price in Rs. per kg
    stock_quantity = Column(Float, nullable=False, default=0.0) # Inventory in kg (Decimal supported)
    image_url = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False) # Soft-deletion flag
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # [OOP Association: 1-to-Many Relationship]
    # 1 Product variety can appear in Many OrderItems
    order_items = relationship("OrderItem", back_populates="product")

