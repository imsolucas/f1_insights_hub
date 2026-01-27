"""Pydantic schemas for standings data."""
from pydantic import BaseModel
from typing import Optional


class StandingsSyncRequest(BaseModel):
    """Request schema for standings sync."""
    season: int


class DriverStandingData(BaseModel):
    """Driver standing data schema."""
    season: int
    round: int
    driver_id: str
    position: int
    points: float
    wins: int


class ConstructorStandingData(BaseModel):
    """Constructor standing data schema."""
    season: int
    round: int
    constructor_id: str
    position: int
    points: float
    wins: int


class StandingsSyncResponse(BaseModel):
    """Response schema for standings sync."""
    success: bool
    message: str
    driver_standings_synced: int
    constructor_standings_synced: int
    errors: Optional[list[str]] = None
