from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base
import app.models  # Ensures all models are registered with Base metadata
from app.api import auth_router, products_router, orders_router

# Auto-create tables in MySQL on startup
try:
    Base.metadata.create_all(bind=engine)
    print("Database tables initialized successfully.")
except Exception as e:
    print(f"Notice during table creation: {e}")

app = FastAPI(
    title="TOMAT App API",
    description="Fresh Produce E-Commerce & Inventory Management System API",
    version=settings.PROJECT_VERSION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for React frontend (Vite default port 5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins during development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(auth_router)
app.include_router(products_router)
app.include_router(orders_router)

@app.get("/", tags=["Root"])
def root():
    return {
        "message": "Welcome to the TOMAT App API - Fresh Produce E-Commerce & Inventory Management",
        "documentation": "/docs",
        "status": "online"
    }
