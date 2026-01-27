"""Pydantic schemas for lineup data."""
from pydantic import BaseModel
from typing import Optional


class LineupSyncRequest(BaseModel):
    """Request schema for lineup sync."""
    season: int


class DriverLineupData(BaseModel):
    """Driver lineup data schema."""
    season: int
    driver_id: str
    team_name: str
    driver_number: Optional[int] = None


class ConstructorLineupData(BaseModel):
    """Constructor lineup data schema."""
    season: int
    constructor_id: str


class LineupSyncResponse(BaseModel):
    """Response schema for lineup sync."""
    success: bool
    message: str
    drivers_synced: int
    constructors_synced: int
    errors: Optional[list[str]] = None
