# 🍅 TOMAT App — Fresh Produce E-Commerce & Inventory Management

> **Project Status:** ✅ PROJECT COMPLETED  
> Full-Stack Internship Practice Project featuring a **Customer Storefront** and an **Admin Inventory Dashboard**.

---

## 🌐 Live Deployments

- **Frontend App:** [https://tomat-53li26gzi-orchestrator7.vercel.app](https://tomat-53li26gzi-orchestrator7.vercel.app)
- **Backend API:** [https://tomat-app-87xg.vercel.app](https://tomat-app-87xg.vercel.app)
- **Interactive API Docs (Swagger):** [https://tomat-app-87xg.vercel.app/docs](https://tomat-app-87xg.vercel.app/docs)
- **Database:** Aiven Managed Cloud MySQL (`defaultdb`)

---

## 🚀 Demo Accounts & Credentials

| Role | Email | Password | What You Can Test |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@tomat.com` | `admin123` | Inventory CRUD, Low-Stock Alerts (< 10 kg), Order Status Updates |
| **Customer** | `customer@tomat.com` | `customer123` | Product Catalog, Cart, Checkout, Order Tracking & Cancellation |

*(Quick demo buttons are also available on the Login page).*

---

## 🛠️ Tech Stack

- **Frontend:** React.js, Tailwind CSS, Lucide Icons
- **Backend:** Python (FastAPI), SQLAlchemy (ORM), MySQL
- **Authentication:** JWT Bearer Tokens & BCrypt Password Hashing

---

## 📦 How to Run Locally

### 1. Start MySQL
Open **XAMPP** and click **Start** on **MySQL**.

### 2. Start Backend
```powershell
.\venv\Scripts\Activate.ps1
python backend/seed_data.py
cd backend
uvicorn app.main:app --reload --port 8000
```
- API Docs: `http://localhost:8000/docs`

### 3. Start Frontend
```powershell
cd frontend
npm run dev
```
- Website: `http://localhost:5173`

---

## ✨ Key Assignment Features

- **Storefront:** 6 tomato varieties (Cherry, Roma, Beefsteak, Heirloom, Campari, Green) with real-time stock levels and pack/kg pricing.
- **Cart & Dynamic Delivery:** Free delivery on orders over Rs. 500 (Rs. 50 standard fee).
- **Checkout:** Cash on Delivery & Demo Card options.
- **Order Pipeline:** Visual status tracker (`Pending` ➔ `Shipped` ➔ `Delivered`) and customer cancellation.
- **Admin Inventory:** Add/edit varieties, soft-delete, and **Low-Stock Alerting (< 10 kg)** with 1-click restock.

---

## 📡 RESTful API Specifications

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register a new customer account |
| `POST` | `/api/auth/login` | Public | Authenticate user & issue JWT token |
| `GET` | `/api/products` | Public | Fetch list of available tomato products |
| `POST` | `/api/products` | Admin | Create a new tomato product entry |
| `PUT` | `/api/products/:id` | Admin | Update stock, price, or product details |
| `POST` | `/api/orders` | Customer | Submit a new order with cart items |
| `GET` | `/api/orders/my-orders` | Customer | Retrieve logged-in user's order history |
| `PATCH` | `/api/orders/:id/status` | Admin | Update order status (Pending/Shipped/Delivered) |

