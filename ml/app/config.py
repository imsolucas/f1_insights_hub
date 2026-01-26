"""Configuration management for ML service."""
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

# Database
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://localhost/f1_insight_hub")

# FastF1
FASTF1_CACHE_DIR = os.getenv("FASTF1_CACHE_DIR", "./cache")
Path(FASTF1_CACHE_DIR).mkdir(parents=True, exist_ok=True)

# Server
PORT = int(os.getenv("PORT", "8000"))
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")

# CORS
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3001").split(",")

# Service Info
SERVICE_NAME = "f1-insight-ml-service"
SERVICE_VERSION = "1.0.0"
