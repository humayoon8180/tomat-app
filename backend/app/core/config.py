import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env file
env_path = Path(__file__).resolve().parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

class Settings:
    PROJECT_NAME: str = "TOMAT App"
    PROJECT_VERSION: str = "1.0.0"

    # MySQL Database Settings
    DB_HOST: str = os.getenv("DB_HOST", "localhost")
    DB_PORT: str = os.getenv("DB_PORT", "3306")
    DB_USER: str = os.getenv("DB_USER", "root")
    DB_PASSWORD: str = os.getenv("DB_PASSWORD", "")
    DB_NAME: str = os.getenv("DB_NAME", "tomat_db")

    @property
    def DATABASE_URL(self) -> str:
        # PyMySQL connection string: mysql+pymysql://<user>:<password>@<host>:<port>/<dbname>
        if self.DB_PASSWORD:
            return f"mysql+pymysql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}?charset=utf8mb4"
        return f"mysql+pymysql://{self.DB_USER}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}?charset=utf8mb4"

    # JWT Authentication
    SECRET_KEY: str = os.getenv("SECRET_KEY", "tomat_app_secret_key_default_384729")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

    # Business Rules
    LOW_STOCK_THRESHOLD: float = float(os.getenv("LOW_STOCK_THRESHOLD", "10.0"))

settings = Settings()
