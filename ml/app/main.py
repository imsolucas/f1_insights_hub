"""FastAPI application bootstrap."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import ALLOWED_ORIGINS, SERVICE_NAME, SERVICE_VERSION
from app.api.routes import sync
import logging

logging.basicConfig(
    level=logging.INFO,
    format='{"time": "%(asctime)s", "level": "%(levelname)s", "message": "%(message)s"}',
)

logger = logging.getLogger(__name__)

app = FastAPI(
    title=SERVICE_NAME,
    version=SERVICE_VERSION,
    description="F1 Insight Hub ML Service - FastF1 data synchronization",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(sync.router, prefix="/api/sync", tags=["sync"])


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": SERVICE_NAME,
        "version": SERVICE_VERSION,
    }


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "service": SERVICE_NAME,
        "version": SERVICE_VERSION,
        "endpoints": {
            "health": "/health",
            "sync_drivers": "/api/sync/drivers",
            "sync_teams": "/api/sync/teams",
            "sync_lineups": "/api/sync/lineups",
            "info": "/api/sync/info",
        },
    }
