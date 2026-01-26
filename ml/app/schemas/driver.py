"""Pydantic schemas for driver data."""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class DriverSyncRequest(BaseModel):
    """Request schema for driver sync."""
    seasons: Optional[list[int]] = None  # If None, syncs current season + recent years


class DriverData(BaseModel):
    """Driver data schema for database insertion."""
    driver_id: str
    code: Optional[str] = None
    forename: str
    surname: str
    date_of_birth: Optional[datetime] = None
    nationality: str
    url: Optional[str] = None
    permanent_number: Optional[int] = None
    driver_championships: int = 0
    constructor_championships: int = 0
    current_team: Optional[str] = None
    is_active: bool = True


class DriverSyncResponse(BaseModel):
    """Response schema for driver sync."""
    success: bool
    message: str
    drivers_synced: int
    errors: Optional[list[str]] = None
