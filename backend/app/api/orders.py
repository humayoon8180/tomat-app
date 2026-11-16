"""
[DSA & DATABASE INTEGRITY: Atomic Transactions & Inventory Decrement Algorithm]

Why is this critical?
1. Race Conditions: If two customers order the last 5 kg of Cherry tomatoes at the same millisecond,
   without row-locking, both might succeed and inventory becomes negative (-5 kg)!
2. Row-Level Locking ('with_for_update()'): Locks the specific product row during the transaction.
3. ACID Compliance: All items are processed atomically. If item #3 has insufficient stock,
   the entire transaction rolls back ('db.rollback()') so items #1 and #2 aren't deducted either.
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_user, require_admin
from app.models.user import User
from app.models.product import Product
from app.models.order import Order, OrderItem
from app.schemas.order import OrderCreate, OrderOut, OrderStatusUpdate

router = APIRouter(prefix="/api/orders", tags=["Orders"])

@router.post("", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
def create_order(
    order_data: OrderCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    [ORDER CREATION ALGORITHM]
    Time Complexity: O(N) where N = number of items in cart.
    Space Complexity: O(N) for order line item records.
    """
    # Guard clause: ensure cart is not empty
    if not order_data.items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Order must contain at least one product."
        )

    total_amount = 0.0
    order_items_to_create = []

    try:
        # Loop through each item in the order: O(N)
        for item in order_data.items:
            # Query product with exclusive row-level lock (FOR UPDATE in MySQL)
            product = db.query(Product).filter(Product.id == item.product_id).with_for_update().first()
            if not product:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Product with ID {item.product_id} not found."
                )

            # Business Check 1: Is product active?
            if not product.is_active:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Product '{product.title}' is currently unavailable."
                )

            # Business Check 2: Stock availability (DSA check)
            if product.stock_quantity < item.quantity:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Insufficient stock for '{product.title}'. Available: {product.stock_quantity} kg, Requested: {item.quantity} kg."
                )

            # State Mutation: Deduct available stock in real-time
            product.stock_quantity -= item.quantity
            line_total = product.price_per_unit * item.quantity
            total_amount += line_total

            order_items_to_create.append({
                "product_id": product.id,
                "quantity": item.quantity,
                "unit_price": product.price_per_unit
            })


        # Delivery fee calculation (e.g. standard flat fee or free over threshold)
        delivery_fee = 50.0 if total_amount < 500.0 else 0.0
        final_total = round(total_amount + delivery_fee, 2)

        # Create Order record
        new_order = Order(
            user_id=current_user.id,
            total_amount=final_total,
            shipping_address=order_data.shipping_address,
            contact_number=order_data.contact_number,
            payment_method=order_data.payment_method,
            status="Pending"
        )
        db.add(new_order)
        db.flush() # Populate new_order.id

        # Create OrderItems records
        for item_info in order_items_to_create:
            order_item = OrderItem(
                order_id=new_order.id,
                product_id=item_info["product_id"],
                quantity=item_info["quantity"],
                unit_price=item_info["unit_price"]
            )
            db.add(order_item)

        db.commit()
        db.refresh(new_order)
        return new_order

    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to place order: {str(e)}"
        )

@router.get("/my-orders", response_model=List[OrderOut])
def get_my_orders(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Customer: Retrieve logged-in user's order history."""
    orders = db.query(Order).filter(Order.user_id == current_user.id).order_by(Order.id.desc()).all()
    return orders

@router.patch("/{id}/cancel", response_model=OrderOut)
def cancel_customer_order(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Customer: Cancel their own order if still in 'Pending' status and auto-restock."""
    order = db.query(Order).filter(Order.id == id, Order.user_id == current_user.id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found.")

    if order.status != "Pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot cancel order with status '{order.status}'. Only 'Pending' orders can be cancelled."
        )

    # Restock products in MySQL
    for item in order.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if product:
            product.stock_quantity += item.quantity

    order.status = "Cancelled"
    db.commit()
    db.refresh(order)
    return order

@router.get("", response_model=List[OrderOut])
def get_all_orders_admin(
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Admin only: View all customer incoming orders."""
    return db.query(Order).order_by(Order.id.desc()).all()

@router.patch("/{id}/status", response_model=OrderOut)
def update_order_status(
    id: int,
    status_update: OrderStatusUpdate,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Admin only: Update order status (Pending, Shipped, Delivered, Cancelled)."""
    valid_statuses = ["Pending", "Shipped", "Delivered", "Cancelled"]
    if status_update.status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
        )

    order = db.query(Order).filter(Order.id == id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found.")

    # If admin cancels an order, restock the products
    if status_update.status == "Cancelled" and order.status != "Cancelled":
        for item in order.items:
            product = db.query(Product).filter(Product.id == item.product_id).first()
            if product:
                product.stock_quantity += item.quantity

    order.status = status_update.status
    db.commit()
    db.refresh(order)
    return order
