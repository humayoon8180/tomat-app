# TOMAT App — Fresh Produce E-Commerce & Inventory Management System

A full-stack web application designed for ordering fresh tomatoes and organic produce directly from local farms. It features two perspectives: **Customer Storefront** and **Admin Inventory Dashboard**.

---

## 🛠️ Tech Stack
- **Frontend:** React.js, Tailwind CSS v4, Lucide Icons, React Router DOM, Axios
- **Backend:** Python 3 (FastAPI), SQLAlchemy ORM, PyMySQL, Pydantic v2, JWT (python-jose), BCrypt
- **Database:** MySQL (via XAMPP)

---

## 🚀 Quick Setup & Run Instructions

### 1. Start MySQL Database
1. Open your **XAMPP Control Panel**.
2. Click **Start** next to **MySQL** (Default port `3306`).
*(The backend is configured to automatically create the database `tomat_db` and tables upon startup).*

---

### 2. Run Backend (FastAPI)
Open a terminal in the project root:

```powershell
# 1. Activate virtual environment
.\venv\Scripts\Activate.ps1

# 2. Seed initial data (Creates Admin & Customer accounts + sample tomato varieties)
python backend/seed_data.py

# 3. Start the FastAPI backend server
cd backend
uvicorn app.main:app --reload --port 8000
```

- **Backend API URL:** `http://localhost:8000`
- **Swagger / Interactive API Docs:** `http://localhost:8000/docs`

---

### 3. Run Frontend (React + Tailwind CSS)
Open a second terminal:

```powershell
cd frontend
npm run dev
```

- **Customer Storefront:** `http://localhost:5173`

---

## 🔑 Demo Login Credentials

For quick evaluation and testing:

| Role | Email | Password | Access / Perspective |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@tomat.com` | `admin123` | Inventory CRUD, Low-Stock Alerting, Order Status Management |
| **Customer** | `customer@tomat.com` | `customer123` | Browsing Varieties, Cart, Checkout, Order Tracking |

*(You can also click the quick demo buttons on the `/login` page to auto-fill credentials).*

---

## 📋 Key Assignment Features Implemented

### Module A: User Authentication & Roles
- Secure password hashing with **BCrypt**.
- **JWT (JSON Web Token)** authentication & expiration.
- Role-based middleware (`require_admin`) protecting administrative routes.

### Module B: Customer Storefront
- **Product Catalog:** Real-time tomato varieties (Roma, Cherry, Beefsteak, Heirloom, Campari, Green) with stock levels, price/kg, and stock status badges.
- **Shopping Cart:** Quantity selector, stock limit checks, and dynamic delivery fee calculation (Free over Rs. 500).
- **Checkout Flow:** Shipping address, contact phone, and payment method selection (Cash on Delivery or Dummy Card).
- **Order History:** Real-time tracking of order status (`Pending`, `Shipped`, `Delivered`, `Cancelled`).

### Module C: Admin Dashboard
- **Inventory CRUD:** Add new tomato varieties, edit price/stock, and deactivate items.
- **Order Management:** View incoming orders, items breakdown, customer address, and status update dropdown.
- **Low-Stock Alerting:** Prominent visual warning banner when variety stock falls **below 10 kg** with 1-click restock shortcut.
- **Atomic Stock Deduction:** Placing an order automatically deducts product inventory in the database.
