"""FastF1 data fetching service."""
import logging
from typing import Optional
import fastf1
from fastf1.core import Session
from fastf1.ergast import Ergast
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

# Current season year
CURRENT_SEASON = 2026

# Confirmed 2026 F1 driver lineup (official race drivers only)
# This is used to filter out test/reserve drivers from sessions
# Updated based on official 2026 lineup - excludes MAG, ZHO, TSU, DOO
CONFIRMED_2026_DRIVERS = {
    # Alpine
    "GAS",  # Pierre Gasly
    "COL",  # Franco Colapinto
    # Aston Martin
    "ALO",  # Fernando Alonso
    "STR",  # Lance Stroll
    # Audi (formerly Sauber)
    "BOR",  # Gabriel Bortoleto
    "HUL",  # Nico Hulkenberg
    # Cadillac
    "PER",  # Sergio Pérez
    "BOT",  # Valtteri Bottas
    # Ferrari
    "LEC",  # Charles Leclerc
    "HAM",  # Lewis Hamilton
    # Haas
    "BEA",  # Oliver Bearman
    "OCO",  # Esteban Ocon
    # McLaren
    "NOR",  # Lando Norris
    "PIA",  # Oscar Piastri
    # Mercedes
    "RUS",  # George Russell
    "ANT",  # Kimi Antonelli
    # Racing Bulls
    "LAW",  # Liam Lawson
    "LIN",  # Arvid Lindblad (confirmed for 2026)
    # Red Bull Racing
    "VER",  # Max Verstappen
    "HAD",  # Isack Hadjar
    # Williams
    "SAI",  # Carlos Sainz
    "ALB",  # Alexander Albon
}


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


def _find_best_session(year: int, schedule: pd.DataFrame) -> tuple[Optional[Session], Optional[str], Optional[str]]:
    """
    Find the best available session for extracting driver/team data.
    Prioritizes completed sessions with results data.
    
    Returns: (session, session_type, event_name) or (None, None, None)
    """
    session_types = ["R", "Q", "FP3", "FP2", "FP1"]  # Race > Qualifying > Practice
    
    # For current/future seasons, also allow testing/shakedown sessions
    # as they may be the only available data
    allow_testing = year >= CURRENT_SEASON
    
    # Try to find a session with results, starting from most recent events
    for idx in range(len(schedule) - 1, -1, -1):
        try:
            event = schedule.iloc[idx]
            event_name = event["EventName"]
            
            # Skip testing events only if not current season (they may be only available data)
            if not allow_testing and ("Testing" in event_name or "Test" in event_name or "Shakedown" in event_name):
                continue
            
            # Try each session type in priority order
            for sess_type in session_types:
                try:
                    test_session = fastf1.get_session(year, event_name, sess_type)
                    # Load minimal data first to check if session is valid
                    test_session.load(weather=False, messages=False, telemetry=False, laps=False)
                    
                    # Check if session has drivers and results
                    has_drivers = len(test_session.drivers) > 0
                    has_results = hasattr(test_session, 'results') and not test_session.results.empty
                    
                    if has_drivers and has_results:
                        # This is ideal - we have both drivers and results with team info
                        logger.info(f"Found ideal session: {event_name} {sess_type} with {len(test_session.drivers)} drivers")
                        return test_session, sess_type, event_name
                    elif has_drivers:
                        # Has drivers but no results - might still be useful
                        logger.debug(f"Found session with drivers but no results: {event_name} {sess_type}")
                        # Continue searching for better session, but keep this as fallback
                        continue
                except Exception as e:
                    logger.debug(f"Could not load {event_name} {sess_type}: {e}")
                    continue
        except Exception as e:
            logger.debug(f"Error processing event: {e}")
            continue
    
    # Fallback: try first event if no completed session found
    logger.warning("No completed session with results found, trying first event (including testing)")
    try:
        first_event = schedule.iloc[0]
        event_name = first_event["EventName"]
        # For current season, try all session types including testing
        fallback_types = ["R", "Q", "FP3", "FP2", "FP1"] if year >= CURRENT_SEASON else ["R", "Q"]
        for sess_type in fallback_types:
            try:
                session = fastf1.get_session(year, event_name, sess_type)
                session.load(weather=False, messages=False, telemetry=False, laps=False)
                if len(session.drivers) > 0:
                    logger.info(f"Using fallback session: {event_name} {sess_type} with {len(session.drivers)} drivers")
                    return session, sess_type, event_name
            except Exception as e:
                logger.debug(f"Fallback session {event_name} {sess_type} failed: {e}")
                continue
    except Exception as e:
        logger.error(f"Failed to load fallback session: {e}")
    
    return None, None, None


def fetch_current_season_drivers(year: int = CURRENT_SEASON, filter_confirmed: bool = True) -> list[dict]:
    """
    Fetch drivers from a specific season using FastF1 with improved team extraction.
    
    This function prioritizes sessions with results data (which contains reliable team information)
    and extracts driver-team mappings from the session.results DataFrame.
    
    Args:
        year: Season year to fetch drivers for (default: CURRENT_SEASON)
        filter_confirmed: Whether to filter to confirmed drivers for current/future seasons (default: True)
    
    For future seasons (2026+), falls back to previous season (2025) if no data available.
    """
    try:
        logger.info(f"Fetching drivers for season {year}")
        
        # Get schedule for the season
        schedule = fastf1.get_event_schedule(year)
        
        if schedule.empty:
            logger.warning(f"No events found for season {year}")
            # For future seasons (not yet started), try previous season as fallback
            if year > CURRENT_SEASON and year > 2015:
                logger.info(f"Season {year} hasn't started yet. Trying previous season ({year - 1}) as fallback")
                return fetch_current_season_drivers(year - 1, filter_confirmed=False)
            # For current season with no schedule, try previous season
            elif year == CURRENT_SEASON and year > 2015:
                logger.info(f"No schedule for current season {year}. Trying previous season ({year - 1}) as fallback")
                return fetch_current_season_drivers(year - 1, filter_confirmed=False)
            return []
        
        # Find the best available session
        session, session_type, event_name = _find_best_session(year, schedule)
        
        if session is None or len(session.drivers) == 0:
            logger.warning(f"No valid session found with drivers for season {year}")
            # For future seasons (not yet started), try previous season as fallback
            if year > CURRENT_SEASON and year > 2015:
                logger.info(f"Season {year} hasn't started yet. Trying previous season ({year - 1}) as fallback")
                fallback_drivers = fetch_current_season_drivers(year - 1, filter_confirmed=False)
                if fallback_drivers and filter_confirmed:
                    # Filter to only confirmed drivers for the requested future season
                    confirmed_codes = {code.upper() for code in CONFIRMED_2026_DRIVERS}
                    filtered = [d for d in fallback_drivers if d.get('code', '').upper() in confirmed_codes]
                    logger.info(f"Filtered {len(fallback_drivers)} drivers from {year - 1} to {len(filtered)} confirmed {year} drivers")
                    return filtered
                return fallback_drivers if fallback_drivers else []
            # For current season with no session data, try previous season
            elif year == CURRENT_SEASON and year > 2015:
                logger.info(f"No {year} session data available yet. Trying previous season ({year - 1}) as fallback")
                fallback_drivers = fetch_current_season_drivers(year - 1, filter_confirmed=False)
                if fallback_drivers and filter_confirmed:
                    confirmed_codes = {code.upper() for code in CONFIRMED_2026_DRIVERS}
                    filtered = [d for d in fallback_drivers if d.get('code', '').upper() in confirmed_codes]
                    logger.info(f"Filtered {len(fallback_drivers)} drivers from {year - 1} to {len(filtered)} confirmed {year} drivers")
                    return filtered
                return fallback_drivers if fallback_drivers else []
            logger.warning(f"Could not fetch drivers for season {year} - no data available")
            return []
        
        # Build comprehensive driver-to-team mapping from session.results (most reliable source)
        driver_team_map = {}
        driver_number_map = {}  # Map driver code to permanent number
        number_to_abbrev_map = {}  # Map permanent number to abbreviation (3-letter code)
        abbrev_to_number_map = {}  # Map abbreviation to permanent number
        
        try:
            if hasattr(session, 'results') and not session.results.empty:
                # session.results is a DataFrame with columns like:
                # Abbreviation, TeamName, DriverNumber, FullName, etc.
                for _, row in session.results.iterrows():
                    abbrev = str(row.get('Abbreviation', '')).strip().upper()
                    team = row.get('TeamName', '')
                    driver_number = row.get('DriverNumber', None)
                    
                    if abbrev and len(abbrev) == 3:  # Only use 3-letter codes
                        if team:
                            driver_team_map[abbrev] = team
                        if driver_number is not None:
                            driver_num = int(driver_number)
                            driver_number_map[abbrev] = driver_num
                            number_to_abbrev_map[driver_num] = abbrev
                            abbrev_to_number_map[abbrev] = driver_num
                
                logger.info(f"Extracted team mappings for {len(driver_team_map)} drivers from results")
                logger.info(f"Abbreviation mapping: {sorted(abbrev_to_number_map.items())}")
        except Exception as e:
            logger.warning(f"Could not extract team mapping from results: {e}")
        
        # Fallback: try to get team info from laps if results didn't have it
        if len(driver_team_map) < len(session.drivers):
            try:
                # Load laps data (minimal) to get team info for missing drivers
                session.load(laps=True)
                if hasattr(session, 'laps') and not session.laps.empty:
                    for driver_code in session.drivers:
                        if driver_code not in driver_team_map:
                            try:
                                driver_laps = session.laps.pick_drivers([driver_code])
                                if not driver_laps.empty:
                                    team = driver_laps.iloc[0].get("Team", None)
                                    if team:
                                        driver_team_map[driver_code] = team
                            except Exception:
                                pass
            except Exception as e:
                logger.debug(f"Could not extract team from laps: {e}")
        
        # Extract driver data
        drivers_data = []
        drivers_seen = set()  # Track drivers we've already processed to avoid duplicates (by code)
        driver_ids_seen = set()  # Track by driver_id to prevent duplicates
        
        # Filter to only confirmed race drivers for current/future seasons (if requested)
        # This prevents test/reserve drivers from being included
        confirmed_drivers = None
        if filter_confirmed and year >= CURRENT_SEASON:
            # Convert to uppercase for case-insensitive comparison
            confirmed_drivers = {code.upper() for code in CONFIRMED_2026_DRIVERS}
            logger.info(f"Filtering to {len(confirmed_drivers)} confirmed {year} race drivers: {sorted(confirmed_drivers)}")
        
        # Process drivers from results DataFrame first (has proper abbreviations)
        # Then fallback to session.drivers if needed
        drivers_to_process = []
        
        # First, try to get drivers from results DataFrame (has proper 3-letter codes)
        if hasattr(session, 'results') and not session.results.empty:
            for _, row in session.results.iterrows():
                abbrev = str(row.get('Abbreviation', '')).strip().upper()
                driver_number = row.get('DriverNumber', None)
                
                # Only use 3-letter abbreviations
                if abbrev and len(abbrev) == 3:
                    drivers_to_process.append(abbrev)
                elif driver_number is not None:
                    # If we have a number but no abbrev, try to get abbrev from map
                    driver_num = int(driver_number)
                    if driver_num in number_to_abbrev_map:
                        abbrev_from_map = number_to_abbrev_map[driver_num]
                        if abbrev_from_map not in drivers_to_process:
                            drivers_to_process.append(abbrev_from_map)
        
        # Fallback: use session.drivers if results didn't have abbreviations
        if not drivers_to_process:
            drivers_to_process = list(session.drivers)
            logger.warning("No abbreviations found in results, using session.drivers (may contain numbers)")
        
        for driver_code in drivers_to_process:
            # Convert to string and normalize
            driver_code_str = str(driver_code).strip().upper()
            
            # If it's a number, try to map it to abbreviation
            if driver_code_str.isdigit():
                driver_num = int(driver_code_str)
                if driver_num in number_to_abbrev_map:
                    driver_code_str = number_to_abbrev_map[driver_num]
                else:
                    logger.warning(f"Driver number {driver_num} not found in abbreviation map, skipping")
                    continue
            
            # Skip if not a 3-letter code
            if len(driver_code_str) != 3:
                logger.debug(f"Skipping invalid driver code format: {driver_code_str}")
                continue
            
            # Skip if we've already processed this driver (safety check)
            if driver_code_str in drivers_seen:
                logger.debug(f"Skipping duplicate driver code: {driver_code_str}")
                continue
            
            # Filter out test/reserve drivers for current season
            if confirmed_drivers and driver_code_str not in confirmed_drivers:
                logger.debug(f"Filtering out unconfirmed/test driver: {driver_code_str} (not in {year} confirmed lineup)")
                continue
            
            drivers_seen.add(driver_code_str)
            
            try:
                # Try to get driver info using the code, fallback to number if needed
                try:
                    driver_info = session.get_driver(driver_code_str)
                except:
                    # If code doesn't work, try using the permanent number
                    if driver_code_str in abbrev_to_number_map:
                        driver_num = abbrev_to_number_map[driver_code_str]
                        driver_info = session.get_driver(str(driver_num))
                    else:
                        raise
                
                # Get team name - use abbreviation from results
                team_name = driver_team_map.get(driver_code_str)
                
                # If still no team, try direct lookup in results
                if not team_name and hasattr(session, 'results') and not session.results.empty:
                    try:
                        # Try case-insensitive match on Abbreviation column
                        driver_result = session.results[
                            session.results['Abbreviation'].str.upper().str.strip() == driver_code_str
                        ]
                        if not driver_result.empty:
                            team_name = driver_result.iloc[0].get('TeamName', None)
                    except Exception:
                        pass
                
                # Normalize team name
                if team_name:
                    team_name = normalize_team_name(team_name)
                
                # Get permanent number - prioritize results mapping, then driver_info
                permanent_number = driver_number_map.get(driver_code_str)
                if permanent_number is None:
                    permanent_number = driver_info.get("DriverNumber")
                
                driver_id = driver_code_str.lower()  # Use 3-letter code for driver_id
                
                # Final duplicate check by driver_id before adding
                if driver_id in driver_ids_seen:
                    logger.debug(f"Skipping duplicate driver_id: {driver_id} (already processed)")
                    continue
                
                driver_ids_seen.add(driver_id)
                
                driver_data = {
                    "driver_id": driver_id,
                    "code": driver_code_str,  # Store uppercase 3-letter code
                    "forename": driver_info.get("FirstName", ""),
                    "surname": driver_info.get("LastName", ""),
                    "nationality": driver_info.get("CountryCode", ""),
                    "permanent_number": permanent_number,
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
        
        logger.info(
            f"Fetched {len(drivers_data)} drivers for season {year} from {event_name} {session_type}. "
            f"Teams extracted: {len([d for d in drivers_data if d.get('current_team')])}"
        )
        return drivers_data
        
    except Exception as e:
        logger.error(f"Error fetching drivers for season {year}: {e}", exc_info=True)
        return []


def normalize_team_name(team_name: str) -> str:
    """
    Normalize team name to standard format.
    Maps various team name variations to canonical names.
    """
    if not team_name:
        return team_name
    
    # Team name mappings - includes 2026 season teams
    team_mappings = {
        # Red Bull Racing
        "Red Bull Racing": "Red Bull Racing",
        "Red Bull Racing RBPT": "Red Bull Racing",
        "Red Bull": "Red Bull Racing",
        "Red Bull Racing Honda RBPT": "Red Bull Racing",
        
        # Ferrari
        "Scuderia Ferrari": "Ferrari",
        "Ferrari": "Ferrari",
        
        # Mercedes
        "Mercedes": "Mercedes",
        "Mercedes-AMG": "Mercedes",
        "Mercedes-AMG Petronas": "Mercedes",
        "Mercedes Petronas": "Mercedes",
        
        # McLaren
        "McLaren": "McLaren",
        "McLaren F1 Team": "McLaren",
        "McLaren Mercedes": "McLaren",
        
        # Aston Martin
        "Aston Martin": "Aston Martin",
        "Aston Martin F1 Team": "Aston Martin",
        "Aston Martin Aramco": "Aston Martin",
        
        # Alpine
        "Alpine": "Alpine",
        "Alpine F1 Team": "Alpine",
        "Alpine Renault": "Alpine",
        
        # Williams
        "Williams": "Williams",
        "Williams Racing": "Williams",
        "Williams Mercedes": "Williams",
        
        # Haas
        "Haas": "Haas F1 Team",
        "Haas F1 Team": "Haas F1 Team",
        "Haas Ferrari": "Haas F1 Team",
        
        # Racing Bulls (formerly AlphaTauri)
        "AlphaTauri": "Racing Bulls",
        "RB": "Racing Bulls",
        "Racing Bulls": "Racing Bulls",
        "Visa Cash App RB": "Racing Bulls",
        "Visa Cash App RB F1 Team": "Racing Bulls",
        
        # Sauber/Audi (2026)
        "Sauber": "Audi",
        "Stake F1 Team": "Audi",
        "Kick Sauber": "Audi",
        "Audi": "Audi",
        "Audi F1 Team": "Audi",
        "Sauber F1 Team": "Audi",
        
        # Cadillac (2026)
        "Cadillac": "Cadillac",
        "Cadillac F1 Team": "Cadillac",
    }
    
    # Try exact match first
    if team_name in team_mappings:
        return team_mappings[team_name]
    
    # Try case-insensitive match
    team_name_lower = team_name.lower()
    for key, value in team_mappings.items():
        if key.lower() == team_name_lower:
            return value
    
    # Try partial match for common patterns
    if "red bull" in team_name_lower:
        return "Red Bull Racing"
    if "ferrari" in team_name_lower:
        return "Ferrari"
    if "mercedes" in team_name_lower:
        return "Mercedes"
    if "mclaren" in team_name_lower:
        return "McLaren"
    if "aston martin" in team_name_lower:
        return "Aston Martin"
    if "alpine" in team_name_lower:
        return "Alpine"
    if "williams" in team_name_lower:
        return "Williams"
    if "haas" in team_name_lower:
        return "Haas F1 Team"
    if "racing bulls" in team_name_lower or "rb" == team_name_lower or "alphatauri" in team_name_lower:
        return "Racing Bulls"
    if "sauber" in team_name_lower or "audi" in team_name_lower:
        return "Audi"
    if "cadillac" in team_name_lower:
        return "Cadillac"
    
    # Return original if no mapping found
    return team_name


def normalize_constructor_id(team_name: str) -> str:
    """
    Normalize team name to constructor_id format (lowercase, spaces to underscores).
    Used for database constructor_id field.
    """
    if not team_name:
        return ""
    
    normalized = normalize_team_name(team_name)
    # Convert to lowercase and replace spaces/hyphens with underscores
    constructor_id = normalized.lower().replace(" ", "_").replace("-", "_")
    # Remove "f1_team" suffix if present
    if constructor_id.endswith("_f1_team"):
        constructor_id = constructor_id[:-8]
    return constructor_id


def get_team_nationality(team_name: str) -> str:
    """
    Get nationality for a team based on team name.
    Returns country code or team name if unknown.
    """
    team_nationalities = {
        "Ferrari": "Italian",
        "Mercedes": "German",
        "Red Bull Racing": "Austrian",
        "McLaren": "British",
        "Aston Martin": "British",
        "Alpine": "French",
        "Williams": "British",
        "Haas F1 Team": "American",
        "Racing Bulls": "Italian",
        "Audi": "German",
        "Cadillac": "American",
    }
    
    normalized = normalize_team_name(team_name)
    return team_nationalities.get(normalized, "Unknown")


def fetch_current_season_teams(year: int = CURRENT_SEASON) -> list[dict]:
    """
    Fetch teams from current season using FastF1.
    
    Extracts unique teams from session results and returns team information.
    Returns teams with constructor_id, name, and nationality.
    """
    try:
        logger.info(f"Fetching teams for season {year}")
        
        # Get schedule for the season
        schedule = fastf1.get_event_schedule(year)
        
        if schedule.empty:
            logger.warning(f"No events found for season {year}")
            # For future seasons, try previous season as fallback
            if year > CURRENT_SEASON and year > 2015:
                logger.info(f"Season {year} hasn't started yet. Trying previous season ({year - 1}) as fallback")
                return fetch_current_season_teams(year - 1)
            return []
        
        # Find the best available session
        session, session_type, event_name = _find_best_session(year, schedule)
        
        if session is None:
            logger.warning(f"No valid session found for season {year}")
            # For future seasons, try previous season as fallback
            if year > CURRENT_SEASON and year > 2015:
                logger.info(f"Season {year} hasn't started yet. Trying previous season ({year - 1}) as fallback")
                return fetch_current_season_teams(year - 1)
            return []
        
        # Extract teams from session results
        teams_data = []
        teams_seen = set()  # Track by normalized name to avoid duplicates
        
        try:
            if hasattr(session, 'results') and not session.results.empty:
                # Get unique teams from results
                for _, row in session.results.iterrows():
                    team_name = row.get('TeamName', '')
                    if not team_name:
                        continue
                    
                    normalized_team = normalize_team_name(team_name)
                    constructor_id = normalize_constructor_id(normalized_team)
                    
                    # Skip if we've already seen this constructor_id
                    if constructor_id in teams_seen:
                        continue
                    
                    teams_seen.add(constructor_id)
                    
                    nationality = get_team_nationality(normalized_team)
                    
                    teams_data.append({
                        "constructor_id": constructor_id,
                        "name": normalized_team,
                        "nationality": nationality,
                    })
                
                logger.info(f"Extracted {len(teams_data)} teams from {event_name} {session_type}")
        except Exception as e:
            logger.warning(f"Could not extract teams from results: {e}")
        
        # Fallback: extract from laps if results didn't work
        if not teams_data:
            try:
                session.load(laps=True)
                if hasattr(session, 'laps') and not session.laps.empty:
                    unique_teams = session.laps['Team'].dropna().unique()
                    for team_name in unique_teams:
                        if not team_name:
                            continue
                        
                        normalized_team = normalize_team_name(team_name)
                        constructor_id = normalize_constructor_id(normalized_team)
                        
                        if constructor_id in teams_seen:
                            continue
                        
                        teams_seen.add(constructor_id)
                        nationality = get_team_nationality(normalized_team)
                        
                        teams_data.append({
                            "constructor_id": constructor_id,
                            "name": normalized_team,
                            "nationality": nationality,
                        })
            except Exception as e:
                logger.debug(f"Could not extract teams from laps: {e}")
        
        return teams_data
        
    except Exception as e:
        logger.error(f"Error fetching teams for season {year}: {e}", exc_info=True)
        return []


def sync_teams(seasons: Optional[list[int]] = None, season: Optional[int] = None) -> dict:
    """
    Sync teams from FastF1 to database.
    
    Args:
        seasons: List of seasons to sync. If None and season is None, syncs only the current season.
        season: Single season to sync (takes precedence over seasons if provided).
    
    Returns:
        Dictionary with teams list and seasons_processed count.
    """
    # Determine which seasons to sync
    if season is not None:
        seasons_to_sync = [season]
    elif seasons is None:
        # Default: only current season (most common use case)
        seasons_to_sync = [CURRENT_SEASON]
    else:
        seasons_to_sync = seasons
    
    all_teams = {}
    all_constructor_ids = set()  # Track by constructor_id to prevent duplicates across seasons
    
    for season_year in seasons_to_sync:
        teams = fetch_current_season_teams(season_year)
        for team in teams:
            constructor_id = team["constructor_id"]
            
            # Skip if we've already seen this constructor_id (prevents duplicates)
            if constructor_id in all_constructor_ids:
                logger.debug(f"Skipping duplicate constructor_id {constructor_id} from season {season_year}")
                continue
            
            # Keep most recent data for each team
            # If same team appears in multiple seasons, prefer the most recent season
            if constructor_id not in all_teams or season_year >= max(seasons_to_sync):
                all_teams[constructor_id] = team
                all_constructor_ids.add(constructor_id)
    
    logger.info(
        f"Synced {len(all_teams)} unique teams from {len(seasons_to_sync)} season(s): {seasons_to_sync}"
    )
    
    return {
        "teams": list(all_teams.values()),
        "seasons_processed": len(seasons_to_sync),
    }


def sync_drivers(seasons: Optional[list[int]] = None, season: Optional[int] = None, filter_confirmed: bool = True) -> dict:
    """
    Sync drivers from FastF1 to database.
    
    Args:
        seasons: List of seasons to sync. If None and season is None, syncs only the current season.
                 To sync multiple seasons, pass a list like [2024, 2025, 2026].
                 To sync historical data, pass a list like list(range(2016, 2027)).
        season: Single season to sync (takes precedence over seasons if provided).
        filter_confirmed: Whether to filter to confirmed drivers for current/future seasons.
    
    Returns:
        Dictionary with drivers list and seasons_processed count.
    """
    # Determine which seasons to sync
    if season is not None:
        seasons_to_sync = [season]
    elif seasons is None:
        # Default: only current season (most common use case)
        seasons_to_sync = [CURRENT_SEASON]
    else:
        seasons_to_sync = seasons
    
    all_drivers = {}
    all_driver_codes = set()  # Track by code to prevent duplicates across seasons
    
    for season_year in seasons_to_sync:
        # Only apply confirmed driver filtering for current/future seasons if requested
        drivers = fetch_current_season_drivers(season_year, filter_confirmed=filter_confirmed)
        for driver in drivers:
            driver_id = driver["driver_id"]
            driver_code = driver.get("code", "").upper()
            
            # Skip if we've already seen this driver code (prevents duplicates)
            if driver_code and driver_code in all_driver_codes:
                logger.debug(f"Skipping duplicate driver code {driver_code} from season {season_year}")
                continue
            
            # Keep most recent data for each driver
            # If same driver appears in multiple seasons, prefer the most recent season
            if driver_id not in all_drivers or season_year >= max(seasons_to_sync):
                all_drivers[driver_id] = driver
                if driver_code:
                    all_driver_codes.add(driver_code)
    
    logger.info(
        f"Synced {len(all_drivers)} unique drivers from {len(seasons_to_sync)} season(s): {seasons_to_sync}"
    )
    
    return {
        "drivers": list(all_drivers.values()),
        "seasons_processed": len(seasons_to_sync),
    }


def fetch_driver_standings(season: int) -> list[dict]:
    """
    Fetch driver championship standings for a season from Ergast API.
    Returns historical standings after each race.
    
    Args:
        season: The season year to fetch standings for
        
    Returns:
        List of dicts with driver standings data for each round
    """
    logger.info(f"Fetching driver standings from Ergast for season {season}")
    
    try:
        ergast = Ergast()
        result = ergast.get_driver_standings(season=season)
        
        if result is None or not hasattr(result, 'content') or not hasattr(result, 'description'):
            logger.warning(f"No driver standings data available for season {season}")
            return []
        
        standings_data = []
        
        # result.description has season/round info
        # result.content is list of DataFrames, one per round
        for i, standings_df in enumerate(result.content):
            if standings_df.empty:
                continue
                
            round_num = int(result.description.iloc[i]['round'])
            
            for _, row in standings_df.iterrows():
                # Normalize driver_id to lowercase to match database format
                driver_id = str(row['driverId']).lower()
                
                standings_data.append({
                    "season": season,
                    "round": round_num,
                    "driver_id": driver_id,
                    "position": int(row['position']),
                    "points": float(row['points']),
                    "wins": int(row['wins']),
                })
        
        logger.info(f"Fetched {len(standings_data)} driver standing records for season {season}")
        return standings_data
        
    except Exception as e:
        logger.error(f"Error fetching driver standings for season {season}: {e}")
        raise


def fetch_constructor_standings(season: int) -> list[dict]:
    """
    Fetch constructor championship standings for a season from Ergast API.
    Returns historical standings after each race.
    
    Args:
        season: The season year to fetch standings for
        
    Returns:
        List of dicts with constructor standings data for each round
    """
    logger.info(f"Fetching constructor standings from Ergast for season {season}")
    
    try:
        ergast = Ergast()
        result = ergast.get_constructor_standings(season=season)
        
        if result is None or not hasattr(result, 'content') or not hasattr(result, 'description'):
            logger.warning(f"No constructor standings data available for season {season}")
            return []
        
        standings_data = []
        
        for i, standings_df in enumerate(result.content):
            if standings_df.empty:
                continue
                
            round_num = int(result.description.iloc[i]['round'])
            
            for _, row in standings_df.iterrows():
                # Normalize constructor_id to match database format
                # Use the constructorName field to get the team name
                constructor_name = str(row.get('constructorName', row.get('constructorId', '')))
                constructor_id = normalize_constructor_id(constructor_name)
                
                standings_data.append({
                    "season": season,
                    "round": round_num,
                    "constructor_id": constructor_id,
                    "position": int(row['position']),
                    "points": float(row['points']),
                    "wins": int(row['wins']),
                })
        
        logger.info(f"Fetched {len(standings_data)} constructor standing records for season {season}")
        return standings_data
        
    except Exception as e:
        logger.error(f"Error fetching constructor standings for season {season}: {e}")
        raise


def calculate_driver_standings_from_results(db_session, season: int) -> list[dict]:
    """
    Calculate driver standings from race results when Ergast data unavailable.
    Queries race results from database, groups by driver, sums points, counts wins.
    
    Args:
        db_session: SQLAlchemy database session
        season: The season year to calculate standings for
        
    Returns:
        List of dicts with calculated driver standings data for each round
    """
    logger.info(f"Calculating driver standings from race results for season {season}")
    
    try:
        from sqlalchemy import text
        
        # Query to get race results and calculate standings per round
        # We need to get all races for the season, then calculate cumulative standings after each round
        races_query = text("""
            SELECT DISTINCT round 
            FROM races 
            WHERE season = :season 
            ORDER BY round ASC
        """)
        races_result = db_session.execute(races_query, {"season": season})
        rounds = [row[0] for row in races_result.fetchall()]
        
        if not rounds:
            logger.warning(f"No races found for season {season}")
            return []
        
        standings_data = []
        
        # Calculate standings after each round
        for round_num in rounds:
            # Get cumulative points and wins for each driver up to this round
            query = text("""
                SELECT 
                    rr.driver_id,
                    COALESCE(SUM(rr.points), 0) as total_points,
                    COUNT(CASE WHEN rr.position = 1 THEN 1 END) as total_wins
                FROM race_results rr
                JOIN races r ON rr.race_id = r.id
                WHERE r.season = :season AND r.round <= :round
                GROUP BY rr.driver_id
                ORDER BY total_points DESC, total_wins DESC
            """)
            
            result = db_session.execute(query, {"season": season, "round": round_num})
            rows = result.fetchall()
            
            if not rows:
                continue
            
            # Assign positions based on sorted order
            for position, row in enumerate(rows, start=1):
                driver_id = row[0]
                points = float(row[1])
                wins = int(row[2])
                
                standings_data.append({
                    "season": season,
                    "round": round_num,
                    "driver_id": driver_id,
                    "position": position,
                    "points": points,
                    "wins": wins,
                })
        
        logger.info(f"Calculated {len(standings_data)} driver standing records for season {season}")
        return standings_data
        
    except Exception as e:
        logger.error(f"Error calculating driver standings for season {season}: {e}")
        raise


def calculate_constructor_standings_from_results(db_session, season: int) -> list[dict]:
    """
    Calculate constructor standings from race results when Ergast data unavailable.
    Queries race results from database, groups by constructor, sums points, counts wins.
    
    Args:
        db_session: SQLAlchemy database session
        season: The season year to calculate standings for
        
    Returns:
        List of dicts with calculated constructor standings data for each round
    """
    logger.info(f"Calculating constructor standings from race results for season {season}")
    
    try:
        from sqlalchemy import text
        
        # Query to get race results and calculate standings per round
        # We need to get all races for the season, then calculate cumulative standings after each round
        races_query = text("""
            SELECT DISTINCT round 
            FROM races 
            WHERE season = :season 
            ORDER BY round ASC
        """)
        races_result = db_session.execute(races_query, {"season": season})
        rounds = [row[0] for row in races_result.fetchall()]
        
        if not rounds:
            logger.warning(f"No races found for season {season}")
            return []
        
        standings_data = []
        
        # Calculate standings after each round
        for round_num in rounds:
            # Get cumulative points and wins for each constructor up to this round
            query = text("""
                SELECT 
                    rr.constructor_id,
                    COALESCE(SUM(rr.points), 0) as total_points,
                    COUNT(CASE WHEN rr.position = 1 THEN 1 END) as total_wins
                FROM race_results rr
                JOIN races r ON rr.race_id = r.id
                WHERE r.season = :season AND r.round <= :round
                GROUP BY rr.constructor_id
                ORDER BY total_points DESC, total_wins DESC
            """)
            
            result = db_session.execute(query, {"season": season, "round": round_num})
            rows = result.fetchall()
            
            if not rows:
                continue
            
            # Assign positions based on sorted order
            for position, row in enumerate(rows, start=1):
                constructor_id = row[0]
                points = float(row[1])
                wins = int(row[2])
                
                standings_data.append({
                    "season": season,
                    "round": round_num,
                    "constructor_id": constructor_id,
                    "position": position,
                    "points": points,
                    "wins": wins,
                })
        
        logger.info(f"Calculated {len(standings_data)} constructor standing records for season {season}")
        return standings_data
        
    except Exception as e:
        logger.error(f"Error calculating constructor standings for season {season}: {e}")
        raise


def get_season_driver_lineup(season: int) -> list[dict]:
    """
    Get driver lineup for a season with team information.
    Returns list of dicts with: season, driver_id, team_name, driver_number
    
    Args:
        season: The season year to get lineup for
        
    Returns:
        List of dicts with driver lineup data
    """
    logger.info(f"Getting driver lineup for season {season}")
    
    try:
        drivers = fetch_current_season_drivers(season, filter_confirmed=False)
        
        lineup_data = []
        for driver in drivers:
            lineup_data.append({
                "season": season,
                "driver_id": driver["driver_id"],
                "team_name": driver.get("current_team", ""),
                "driver_number": driver.get("permanent_number"),
            })
        
        logger.info(f"Extracted {len(lineup_data)} drivers for season {season} lineup")
        return lineup_data
        
    except Exception as e:
        logger.error(f"Error getting driver lineup for season {season}: {e}")
        raise


def get_season_constructor_lineup(season: int) -> list[dict]:
    """
    Get constructor lineup for a season.
    Returns list of dicts with: season, constructor_id
    
    Args:
        season: The season year to get lineup for
        
    Returns:
        List of dicts with constructor lineup data
    """
    logger.info(f"Getting constructor lineup for season {season}")
    
    try:
        teams = fetch_current_season_teams(season)
        
        lineup_data = []
        for team in teams:
            lineup_data.append({
                "season": season,
                "constructor_id": team["constructor_id"],
            })
        
        logger.info(f"Extracted {len(lineup_data)} constructors for season {season} lineup")
        return lineup_data
        
    except Exception as e:
        logger.error(f"Error getting constructor lineup for season {season}: {e}")
        raise
