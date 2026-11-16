"""
[OOP CONCEPT: Encapsulation & Inheritance]
- Class 'User' inherits from SQLAlchemy's 'Base' class (Inheritance).
- Encapsulates user attributes (name, email, password_hash, role) into a single entity.
- Defines a 1-to-Many Relationship: 1 User can have Many Orders.
"""
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base

class User(Base):
    # Name of the table in MySQL
    __tablename__ = "users"

    # [Database Fields / Attributes]
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False) # Indexed for fast O(1) email lookups
    password_hash = Column(String(255), nullable=False) # BCrypt hashed password (Never store plain passwords!)
    role = Column(String(20), default="customer", nullable=False) # Role: 'customer' or 'admin'
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # [OOP Association: 1-to-Many Relationship]
    # 1 User has multiple Orders. If a user is deleted, their orders are removed (cascade delete).
    orders = relationship("Order", back_populates="user", cascade="all, delete-orphan")

