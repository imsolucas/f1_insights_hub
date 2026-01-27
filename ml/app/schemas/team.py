"""Pydantic schemas for team/constructor data."""
from pydantic import BaseModel
from typing import Optional


class TeamSyncRequest(BaseModel):
    """Request schema for team sync."""
    seasons: Optional[list[int]] = None  # If None, syncs current season only
    season: Optional[int] = None  # Single season to sync (takes precedence over seasons if provided)


class TeamData(BaseModel):
    """Team data schema for database insertion."""
    constructor_id: str
    name: str
    nationality: str


class TeamSyncResponse(BaseModel):
    """Response schema for team sync."""
    success: bool
    message: str
    teams_synced: int
    errors: Optional[list[str]] = None
