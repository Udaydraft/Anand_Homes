from functools import lru_cache
from pathlib import Path
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application configuration loaded from environment variables or .env file."""
    
    # App Information
    PROJECT_NAME: str = "Antigravity API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    ENVIRONMENT: str = "production"
    DEBUG: bool = False

    # Uploads Storage
    UPLOAD_DIR: Path = Path(__file__).resolve().parent.parent.parent / "uploads"

    # MongoDB Configuration
    MONGODB_URL: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "antigravity_db"

    # Security & JWT Configuration
    JWT_SECRET: str = "dev-secret-change-in-production-c2a4b8d7f1e94589"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    # CORS Configuration
    CORS_ORIGINS: str = (
        "https://anand-homes-web.vercel.app,"
        "http://localhost:5173,"
        "http://localhost:3000,"
        "http://127.0.0.1:5173"
    )

    @property
    def cors_origins_list(self) -> List[str]:
        """Parse comma-separated CORS origins into a clean trimmed list of explicit origins."""
        origins: List[str] = []
        if self.CORS_ORIGINS:
            for item in self.CORS_ORIGINS.split(","):
                clean = item.strip().rstrip("/")
                if clean and clean != "*":  # Never use wildcard with allow_credentials=True
                    origins.append(clean)

        # Ensure production and development origins are always included
        defaults = [
            "https://anand-homes-web.vercel.app",
            "http://localhost:5173",
            "http://localhost:3000",
            "http://127.0.0.1:5173",
        ]
        for d in defaults:
            if d not in origins:
                origins.append(d)
        return origins

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=True,
    )


@lru_cache()
def get_settings() -> Settings:
    return Settings()
