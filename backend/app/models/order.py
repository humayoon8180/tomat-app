"""
[OOP CONCEPT: Composition & Master-Detail Pattern]
- 'Order' is the Master entity representing a customer transaction.
- 'OrderItem' is the Detail entity representing line items inside that transaction.
- Foreign Key Constraints ensure referential integrity in MySQL.
"""
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    total_amount = Column(Float, nullable=False) # Sum of line items + delivery fee
    shipping_address = Column(Text, nullable=False)
    contact_number = Column(String(50), nullable=True)
    payment_method = Column(String(50), default="Cash on Delivery", nullable=False)
    status = Column(String(50), default="Pending", nullable=False) # Pending -> Shipped -> Delivered
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # [OOP Relationships]
    user = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Float, nullable=False) # In kg
    unit_price = Column(Float, nullable=False) # Historical price at the time of purchase

    # [OOP Relationships]
    order = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="order_items")

