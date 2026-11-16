"""
Seed Script to populate initial database records for TOMAT App:
- Default Admin & Customer users
- Initial tomato product varieties (with some below 10 kg to test low-stock alerting)
"""
from app.core.database import SessionLocal, engine, Base
from app.core.security import hash_password
from app.models.user import User
from app.models.product import Product

def seed():
    # Create tables
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        print("Checking initial users...")
        # 1. Seed Admin User
        admin_email = "admin@tomat.com"
        admin_user = db.query(User).filter(User.email == admin_email).first()
        if not admin_user:
            admin_user = User(
                name="Tomat Admin",
                email=admin_email,
                password_hash=hash_password("admin123"),
                role="admin"
            )
            db.add(admin_user)
            print(f"Created Admin: {admin_email} (password: admin123)")

        # 2. Seed Customer User
        customer_email = "customer@tomat.com"
        customer_user = db.query(User).filter(User.email == customer_email).first()
        if not customer_user:
            customer_user = User(
                name="John Doe",
                email=customer_email,
                password_hash=hash_password("customer123"),
                role="customer"
            )
            db.add(customer_user)
            print(f"Created Customer: {customer_email} (password: customer123)")

        # 3. Seed Tomato Varieties
        existing_products_count = db.query(Product).count()
        if existing_products_count == 0:
            sample_products = [
                Product(
                    title="Fresh Roma Plum Tomatoes",
                    variety="Roma",
                    description="Firm, meaty tomatoes with few seeds and low moisture content. Perfect for rich tomato pastes, thick sauces, and canning.",
                    price_per_unit=180.0,
                    stock_quantity=45.0, # Healthy stock
                    image_url="https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80",
                    is_active=True
                ),
                Product(
                    title="Sweet Organic Cherry Tomatoes",
                    variety="Cherry",
                    description="Bite-sized, intensely sweet red cherry tomatoes bursting with fresh flavor. Hand-picked daily from local organic greenhouses.",
                    price_per_unit=320.0,
                    stock_quantity=22.0, # Healthy stock
                    image_url="https://images.unsplash.com/photo-1591267200882-a62cebc3c329?w=800&auto=format&fit=crop&q=80",
                    is_active=True
                ),
                Product(
                    title="Giant Farm Beefsteak Tomatoes",
                    variety="Beefsteak",
                    description="Classic large, juicy slicing tomatoes with a balanced sweet-acidic profile. The ultimate choice for sandwiches and burgers.",
                    price_per_unit=240.0,
                    stock_quantity=7.5, # LOW STOCK (< 10 kg) to trigger assignment alert
                    image_url="https://images.unsplash.com/photo-1582284540020-8acbe03f4924?w=600&auto=format&fit=crop&q=80",
                    is_active=True
                ),
                Product(
                    title="Heritage Colorful Heirloom Tomatoes",
                    variety="Heirloom",
                    description="Grown from non-hybrid seeds passed down through generations. Unique rustic colors, rich complex flavor, and delicate skins.",
                    price_per_unit=420.0,
                    stock_quantity=18.0, # Healthy stock
                    image_url="https://images.unsplash.com/photo-1561136594-7f68413baa99?w=600&auto=format&fit=crop&q=80",
                    is_active=True
                ),
                Product(
                    title="Vine-Ripened Campari Tomatoes",
                    variety="Campari",
                    description="Deep red, highly aromatic tomatoes known for their exceptional sweetness and low acidity. Sold on the vine.",
                    price_per_unit=290.0,
                    stock_quantity=5.0, # LOW STOCK (< 10 kg) to trigger assignment alert
                    image_url="https://images.unsplash.com/photo-1524593166156-312f362cada0?w=600&auto=format&fit=crop&q=80",
                    is_active=True
                ),
                Product(
                    title="Tangy Farm Green Tomatoes",
                    variety="Green Standard",
                    description="Crisp, firm green tomatoes harvested early. Essential for fried green tomato recipes, savory chutneys, and pickles.",
                    price_per_unit=150.0,
                    stock_quantity=35.0, # Healthy stock
                    image_url="https://images.unsplash.com/photo-1607305387299-a3d9611cd469?w=600&auto=format&fit=crop&q=80",
                    is_active=True
                )
            ]
            db.add_all(sample_products)
            print(f"Added {len(sample_products)} tomato varieties (including low-stock items for alert testing).")

        db.commit()
        print("Database seeded successfully!")

    except Exception as e:
        db.rollback()
        print(f"Error during seeding: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed()
