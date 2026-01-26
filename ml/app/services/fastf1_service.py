"""FastF1 data fetching service."""
import logging
from typing import Optional
import fastf1
from fastf1.core import Session
import pandas as pd
from datetime import datetime
from app.config import FASTF1_CACHE_DIR

logger = logging.getLogger(__name__)

# Set FastF1 cache directory
fastf1.Cache.enable_cache(FASTF1_CACHE_DIR)

# Championship winners data (hardcoded for now, can be enhanced with FastF1 historical data)
DRIVER_CHAMPIONSHIPS = {
    "hamilton": 7,
    "schumacher": 7,
    "verstappen": 4,
    "vettel": 4,
    "prost": 4,
    "senna": 3,
    "lauda": 3,
    "piquet": 3,
    "brabham": 3,
    "stewart": 3,
    "fangio": 5,
    "clark": 2,
    "hill": 1,
    "villeneuve": 1,
    "hakkinen": 2,
    "alonso": 2,
    "raikkonen": 1,
    "button": 1,
    "rosberg": 1,
    # Add more as needed
}

# Current 2026 season drivers (will be fetched from FastF1)
CURRENT_SEASON = 2026


def normalize_driver_name(name: str) -> str:
    """Normalize driver name for lookup."""
    return name.lower().replace(" ", "").replace("-", "").replace("_", "")


def get_driver_championships(driver_name: str) -> int:
    """Get driver championship count."""
    normalized = normalize_driver_name(driver_name)
    return DRIVER_CHAMPIONSHIPS.get(normalized, 0)


def get_constructor_championships(driver_name: str, team_name: str) -> int:
    """Get constructor championships for driver's team."""
    # This is simplified - in production, you'd query historical constructor standings
    # For now, return 0 or implement lookup based on team history
    return 0


def fetch_current_season_drivers(year: int = CURRENT_SEASON) -> list[dict]:
    """Fetch drivers from current season using FastF1."""
    try:
        logger.info(f"Fetching drivers for season {year}")
        
        # Get schedule for the season
        schedule = fastf1.get_event_schedule(year)
        
        if schedule.empty:
            logger.warning(f"No events found for season {year}")
            return []
        
        # Try to find a completed race session (prefer later in season for more complete data)
        # Start from the end and work backwards to find a completed race
        session = None
        for idx in range(len(schedule) - 1, -1, -1):
            try:
                event = schedule.iloc[idx]
                # Skip non-race events
                if "Testing" in event["EventName"] or "Test" in event["EventName"]:
                    continue
                
                # Try to load race session with minimal data
                test_session = fastf1.get_session(year, event["EventName"], "R")
                # Only load basic data (no telemetry) to avoid long load times
                test_session.load(weather=False, messages=False, telemetry=False)
                
                # Check if session has drivers
                if len(test_session.drivers) > 0:
                    session = test_session
                    logger.info(f"Using {event['EventName']} for driver data")
                    break
            except Exception as e:
                logger.debug(f"Could not load {event.get('EventName', 'unknown')}: {e}")
                continue
        
        # Fallback to first event if no completed race found
        if session is None:
            logger.warning("No completed race found, trying first event")
            first_event = schedule.iloc[0]
            session = fastf1.get_session(year, first_event["EventName"], "R")
            # Load minimal data only
            session.load(weather=False, messages=False, telemetry=False)
        
        drivers_data = []
        drivers = session.drivers
        
        for driver_code in drivers:
            try:
                driver_info = session.get_driver(driver_code)
                
                # Try to get team from session info (faster than loading laps)
                team_name = None
                try:
                    # Get team from driver info if available
                    if hasattr(session, 'results') and not session.results.empty:
                        driver_result = session.results[session.results['Abbreviation'] == driver_code]
                        if not driver_result.empty:
                            team_name = driver_result.iloc[0].get('TeamName', None)
                except Exception:
                    pass
                
                # Fallback: try to get from laps if available (but don't load full telemetry)
                if not team_name:
                    try:
                        driver_laps = session.laps.pick_drivers([driver_code])
                        if not driver_laps.empty:
                            team_name = driver_laps.iloc[0].get("Team", None)
                    except Exception:
                        pass
                
                driver_data = {
                    "driver_id": driver_code.lower(),
                    "code": driver_code,
                    "forename": driver_info.get("FirstName", ""),
                    "surname": driver_info.get("LastName", ""),
                    "nationality": driver_info.get("CountryCode", ""),
                    "permanent_number": driver_info.get("DriverNumber"),
                    "current_team": team_name,
                    "is_active": True,
                    "driver_championships": get_driver_championships(driver_info.get("LastName", "")),
                    "constructor_championships": get_constructor_championships(
                        driver_info.get("LastName", ""), team_name or ""
                    ),
                }
                
                drivers_data.append(driver_data)
            except Exception as e:
                logger.warning(f"Error fetching driver {driver_code}: {e}")
                continue
        
        logger.info(f"Fetched {len(drivers_data)} drivers for season {year}")
        return drivers_data
        
    except Exception as e:
        logger.error(f"Error fetching drivers for season {year}: {e}")
        return []


def sync_drivers(seasons: Optional[list[int]] = None) -> dict:
    """Sync drivers from FastF1 to database."""
    if seasons is None:
        # Default: current season + recent years
        seasons = list(range(2016, CURRENT_SEASON + 1))
    
    all_drivers = {}
    
    for season in seasons:
        drivers = fetch_current_season_drivers(season)
        for driver in drivers:
            driver_id = driver["driver_id"]
            # Keep most recent data for each driver
            if driver_id not in all_drivers or season == CURRENT_SEASON:
                all_drivers[driver_id] = driver
    
    return {
        "drivers": list(all_drivers.values()),
        "seasons_processed": len(seasons),
    }
