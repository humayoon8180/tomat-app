"""
TOMAT App - Cloud to Local Database Synchronizer
Synchronizes the latest live data from Aiven Cloud / Vercel API into your local XAMPP MySQL (tomat_db).
"""
import urllib.request
import json
import pymysql
from datetime import datetime

CLOUD_API_URL = "https://tomat-app-87xg.vercel.app"

LOCAL_DB_CONFIG = {
    "host": "localhost",
    "port": 3306,
    "user": "root",
    "password": "",
    "database": "tomat_db",
    "charset": "utf8mb4"
}

def sync():
    print("🔄 Connecting to live TOMAT App Cloud API...")

    # 1. Login to Cloud as Admin to fetch full data
    login_data = json.dumps({"email": "admin@tomat.com", "password": "admin123"}).encode("utf-8")
    req = urllib.request.Request(
        f"{CLOUD_API_URL}/api/auth/login",
        data=login_data,
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req) as resp:
        auth_res = json.loads(resp.read().decode())
        token = auth_res["access_token"]
        admin_user = auth_res["user"]

    print("✅ Authenticated with Cloud API.")

    # 2. Fetch live products (with real-time stock levels)
    req_prod = urllib.request.Request(f"{CLOUD_API_URL}/api/products/admin/all", headers={"Authorization": f"Bearer {token}"})
    with urllib.request.urlopen(req_prod) as resp:
        products = json.loads(resp.read().decode())
    print(f"📦 Fetched {len(products)} products from Cloud.")

    # 3. Fetch all orders (with user details and line items)
    req_orders = urllib.request.Request(f"{CLOUD_API_URL}/api/orders", headers={"Authorization": f"Bearer {token}"})
    with urllib.request.urlopen(req_orders) as resp:
        orders = json.loads(resp.read().decode())
    print(f"📋 Fetched {len(orders)} orders from Cloud.")

    # Collect unique users from auth and orders
    users_dict = {}
    if admin_user:
        users_dict[admin_user["email"]] = admin_user
    for o in orders:
        u = o.get("user")
        if u and u.get("email"):
            users_dict[u["email"]] = u

    # 4. Connect to Local XAMPP MySQL
    print("🔌 Connecting to Local XAMPP MySQL (tomat_db)...")
    conn = pymysql.connect(**LOCAL_DB_CONFIG)
    cur = conn.cursor()

    try:
        cur.execute("SET FOREIGN_KEY_CHECKS = 0")

        # Sync Products
        print("🍅 Syncing products & real-time stock quantities...")
        for p in products:
            created_at = p.get("created_at")
            if created_at and "T" in str(created_at):
                created_at = created_at.replace("T", " ").split(".")[0]
            cur.execute("""
                INSERT INTO products (id, title, variety, description, price_per_unit, stock_quantity, image_url, is_active, created_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON DUPLICATE KEY UPDATE
                    title = VALUES(title),
                    variety = VALUES(variety),
                    description = VALUES(description),
                    price_per_unit = VALUES(price_per_unit),
                    stock_quantity = VALUES(stock_quantity),
                    image_url = VALUES(image_url),
                    is_active = VALUES(is_active)
            """, (
                p["id"],
                p["title"],
                p["variety"],
                p.get("description"),
                p["price_per_unit"],
                p["stock_quantity"],
                p.get("image_url"),
                1 if p.get("is_active", True) else 0,
                created_at or datetime.now()
            ))

        # Sync Users (Match by email)
        print(f"👤 Syncing {len(users_dict)} users into local database...")
        email_to_local_id = {}

        for email, u in users_dict.items():
            cur.execute("SELECT id FROM users WHERE email = %s", (email,))
            existing = cur.fetchone()
            created_at = u.get("created_at")
            if created_at and "T" in str(created_at):
                created_at = created_at.replace("T", " ").split(".")[0]

            if existing:
                local_id = existing[0]
                cur.execute("UPDATE users SET name = %s, role = %s WHERE id = %s", (u["name"], u.get("role", "customer"), local_id))
                email_to_local_id[email] = local_id
            else:
                cur.execute("""
                    INSERT INTO users (name, email, password_hash, role, created_at)
                    VALUES (%s, %s, %s, %s, %s)
                """, (
                    u["name"],
                    u["email"],
                    "$2b$12$7BL4vWuYBkjiFj5g3l35zuQh20fnKvcUGHJusSnjCtD...",
                    u.get("role", "customer"),
                    created_at or datetime.now()
                ))
                email_to_local_id[email] = cur.lastrowid

        # Sync Orders & Order Items
        print("📑 Syncing orders and order items...")
        for o in orders:
            created_at = o.get("created_at")
            if created_at and "T" in str(created_at):
                created_at = created_at.replace("T", " ").split(".")[0]

            user_email = o.get("user", {}).get("email")
            local_user_id = email_to_local_id.get(user_email, o["user_id"])

            cur.execute("""
                INSERT INTO orders (id, user_id, total_amount, shipping_address, contact_number, payment_method, status, created_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                ON DUPLICATE KEY UPDATE
                    user_id = VALUES(user_id),
                    total_amount = VALUES(total_amount),
                    shipping_address = VALUES(shipping_address),
                    contact_number = VALUES(contact_number),
                    payment_method = VALUES(payment_method),
                    status = VALUES(status)
            """, (
                o["id"],
                local_user_id,
                o["total_amount"],
                o.get("shipping_address"),
                o.get("contact_number"),
                o.get("payment_method"),
                o.get("status"),
                created_at or datetime.now()
            ))

            for item in o.get("items", []):
                cur.execute("""
                    INSERT INTO order_items (id, order_id, product_id, quantity, unit_price)
                    VALUES (%s, %s, %s, %s, %s)
                    ON DUPLICATE KEY UPDATE
                        order_id = VALUES(order_id),
                        product_id = VALUES(product_id),
                        quantity = VALUES(quantity),
                        unit_price = VALUES(unit_price)
                """, (
                    item["id"],
                    o["id"],
                    item["product_id"],
                    item["quantity"],
                    item["unit_price"]
                ))

        cur.execute("SET FOREIGN_KEY_CHECKS = 1")
        conn.commit()

        # Fetch final counts from local db
        cur.execute("SELECT COUNT(*) FROM users")
        total_users = cur.fetchone()[0]
        cur.execute("SELECT COUNT(*) FROM orders")
        total_orders = cur.fetchone()[0]

        print("\n" + "="*55)
        print("🎉 SUCCESS: Local XAMPP MySQL is now 100% IN SYNC!")
        print(f"   • Total Users in local DB: {total_users}")
        cur.execute("SELECT id, name, email, role FROM users")
        for row in cur.fetchall():
            print(f"     - ID {row[0]}: {row[1]} ({row[2]}) [{row[3]}]")
        print(f"\n   • Total Orders in local DB: {total_orders}")
        cur.execute("SELECT id, total_amount, shipping_address, status FROM orders")
        for row in cur.fetchall():
            print(f"     - Order #{row[0]}: Rs {row[1]} | Address: {row[2]} | Status: {row[3]}")
        print("\n   • Current Live Stock Levels:")
        cur.execute("SELECT variety, stock_quantity FROM products")
        for row in cur.fetchall():
            print(f"     - {row[0]}: {row[1]} kg")
        print("="*55)

    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    sync()
