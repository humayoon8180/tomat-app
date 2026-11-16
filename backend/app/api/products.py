from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import require_admin
from app.core.config import settings
from app.models.product import Product
from app.models.user import User
from app.schemas.product import ProductCreate, ProductUpdate, ProductOut

router = APIRouter(prefix="/api/products", tags=["Products"])

@router.get("", response_model=List[ProductOut])
def get_products(
    variety: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Fetch list of available active tomato products for customer storefront."""
    query = db.query(Product).filter(Product.is_active == True)
    if variety:
        query = query.filter(Product.variety.ilike(f"%{variety}%"))
    if search:
        query = query.filter(
            (Product.title.ilike(f"%{search}%")) | 
            (Product.description.ilike(f"%{search}%")) |
            (Product.variety.ilike(f"%{search}%"))
        )
    return query.all()

@router.get("/admin/all", response_model=List[ProductOut])
def get_all_products_admin(
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Admin only: Fetch all tomato products including inactive ones."""
    return db.query(Product).order_by(Product.id.desc()).all()

@router.get("/admin/low-stock", response_model=List[ProductOut])
def get_low_stock_products(
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Admin only: Alerting endpoint for products where stock falls below 10 kg."""
    return db.query(Product).filter(
        Product.stock_quantity < settings.LOW_STOCK_THRESHOLD,
        Product.is_active == True
    ).all()

@router.get("/{id}", response_model=ProductOut)
def get_product_by_id(id: int, db: Session = Depends(get_db)):
    """Fetch a single tomato product by ID."""
    product = db.query(Product).filter(Product.id == id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found.")
    return product

@router.post("", response_model=ProductOut, status_code=status.HTTP_201_CREATED)
def create_product(
    product_data: ProductCreate,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Admin only: Create a new tomato product entry."""
    new_product = Product(**product_data.model_dump())
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return new_product

@router.put("/{id}", response_model=ProductOut)
def update_product(
    id: int,
    product_data: ProductUpdate,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Admin only: Update stock, price, or product details."""
    product = db.query(Product).filter(Product.id == id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found.")

    update_dict = product_data.model_dump(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(product, key, value)

    db.commit()
    db.refresh(product)
    return product

@router.delete("/{id}", status_code=status.HTTP_200_OK)
def delete_product(
    id: int,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Admin only: Soft-delete/deactivate product."""
    product = db.query(Product).filter(Product.id == id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found.")
    
    product.is_active = False
    db.commit()
    return {"message": f"Product '{product.title}' has been deactivated."}
