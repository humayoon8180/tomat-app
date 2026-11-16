from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings
import re

db_url = settings.DATABASE_URL
connect_args = {}

if db_url.startswith("mysql://"):
    db_url = db_url.replace("mysql://", "mysql+pymysql://", 1)

# Handle cloud MySQL SSL parameters (Aiven, TiDB)
if "ssl-mode=" in db_url or "ssl_mode=" in db_url:
    db_url = re.sub(r'[\?&]ssl[-_]mode=[^&]+', '', db_url)
    connect_args["ssl"] = {"check_hostname": False}
elif "aivencloud" in db_url or "tidbcloud" in db_url:
    connect_args["ssl"] = {"check_hostname": False}

engine = create_engine(
    db_url,
    connect_args=connect_args,
    pool_pre_ping=True,
    pool_recycle=3600
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency for FastAPI routes
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
