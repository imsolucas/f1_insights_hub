"""Sync endpoints for FastF1 data."""
from fastapi import APIRouter, HTTPException
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from app.config import DATABASE_URL
from app.schemas.driver import DriverSyncRequest, DriverSyncResponse
from app.schemas.team import TeamSyncRequest, TeamSyncResponse
from app.schemas.lineup import LineupSyncRequest, LineupSyncResponse
from app.services.fastf1_service import (
    sync_drivers, 
    sync_teams, 
    get_season_driver_lineup,
    get_season_constructor_lineup,
    CURRENT_SEASON, 
    CONFIRMED_2026_DRIVERS
)
import logging
import uuid

logger = logging.getLogger(__name__)

router = APIRouter()

# Database connection
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)


@router.post("/drivers", response_model=DriverSyncResponse)
async def sync_drivers_endpoint(request: DriverSyncRequest):
    """Sync drivers from FastF1 to database."""
    try:
        logger.info("Starting driver sync")
        
        # Fetch drivers from FastF1 (run in thread pool to avoid blocking)
        import asyncio
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(
            None, 
            sync_drivers, 
            request.seasons,
            request.season,
            request.filter_confirmed if request.filter_confirmed is not None else True
        )
        drivers = result["drivers"]
        
        if not drivers:
            return DriverSyncResponse(
                success=False,
                message="No drivers found to sync",
                drivers_synced=0,
            )
        
        # Insert/update drivers in database
        db = SessionLocal()
        errors = []
        synced_count = 0
        
        try:
            # First, clean up any duplicate drivers before syncing
            # Find duplicates by code (3-letter) and keep only the one with the most recent update
            cleanup_query = text("""
                WITH duplicates AS (
                    SELECT 
                        code,
                        COUNT(*) as count,
                        MAX(updated_at) as latest_update
                    FROM drivers
                    WHERE code IS NOT NULL 
                    AND LENGTH(code) = 3
                    GROUP BY code
                    HAVING COUNT(*) > 1
                ),
                to_delete AS (
                    SELECT d.id
                    FROM drivers d
                    INNER JOIN duplicates dup ON d.code = dup.code
                    WHERE d.updated_at < dup.latest_update
                )
                DELETE FROM drivers
                WHERE id IN (SELECT id FROM to_delete)
            """)
            
            try:
                cleanup_result = db.execute(cleanup_query)
                deleted_count = cleanup_result.rowcount
                if deleted_count > 0:
                    logger.info(f"Cleaned up {deleted_count} duplicate driver entries before sync")
            except Exception as e:
                logger.warning(f"Could not clean up duplicates: {e}")
            
            # Also clean up drivers with numeric codes (old format) if we have a 3-letter code version
            cleanup_numeric_query = text("""
                DELETE FROM drivers d1
                WHERE d1.code ~ '^[0-9]+$'
                AND EXISTS (
                    SELECT 1 FROM drivers d2
                    WHERE d2.forename = d1.forename
                    AND d2.surname = d1.surname
                    AND d2.code IS NOT NULL
                    AND LENGTH(d2.code) = 3
                )
            """)
            
            try:
                cleanup_numeric_result = db.execute(cleanup_numeric_query)
                deleted_numeric_count = cleanup_numeric_result.rowcount
                if deleted_numeric_count > 0:
                    logger.info(f"Cleaned up {deleted_numeric_count} drivers with numeric codes (replaced by 3-letter codes)")
            except Exception as e:
                logger.warning(f"Could not clean up numeric code drivers: {e}")
            
            for driver_data in drivers:
                try:
                    driver_id_value = driver_data["driver_id"]
                    driver_code = driver_data.get("code", "").upper() if driver_data.get("code") else None
                    
                    # Normalize driver_id to lowercase for consistency
                    driver_id_value = driver_id_value.lower()
                    
                    # Check if driver exists by driver_id
                    check_query = text("SELECT id FROM drivers WHERE driver_id = :driver_id")
                    existing_row = db.execute(check_query, {"driver_id": driver_id_value}).fetchone()
                    
                    # Also check if there's a duplicate by code (if code is provided)
                    duplicate_by_code = None
                    if driver_code and len(driver_code) == 3:
                        check_code_query = text("""
                            SELECT id, driver_id FROM drivers 
                            WHERE code = :code AND driver_id != :driver_id
                        """)
                        duplicate_row = db.execute(
                            check_code_query, 
                            {"code": driver_code, "driver_id": driver_id_value}
                        ).fetchone()
                        if duplicate_row:
                            duplicate_by_code = duplicate_row
                            logger.warning(
                                f"Found duplicate driver by code {driver_code}: "
                                f"existing driver_id={duplicate_row[1]}, new driver_id={driver_id_value}"
                            )
                    
                    # Generate ID: use existing if found, otherwise generate new UUID
                    record_id = existing_row[0] if existing_row else str(uuid.uuid4())
                    
                    # If we found a duplicate by code, delete it first to prevent conflicts
                    if duplicate_by_code:
                        delete_duplicate_query = text("DELETE FROM drivers WHERE id = :id")
                        db.execute(delete_duplicate_query, {"id": duplicate_by_code[0]})
                        logger.info(f"Deleted duplicate driver entry with id={duplicate_by_code[0]}")
                    
                    # Use raw SQL for upsert (PostgreSQL)
                    query = text("""
                        INSERT INTO drivers (
                            id, driver_id, code, forename, surname, date_of_birth,
                            nationality, url, permanent_number,
                            driver_championships, constructor_championships,
                            current_team, is_active, created_at, updated_at
                        )
                        VALUES (
                            :id, :driver_id, :code, :forename, :surname, :date_of_birth,
                            :nationality, :url, :permanent_number,
                            :driver_championships, :constructor_championships,
                            :current_team, :is_active, NOW(), NOW()
                        )
                        ON CONFLICT (driver_id) DO UPDATE SET
                            code = EXCLUDED.code,
                            forename = EXCLUDED.forename,
                            surname = EXCLUDED.surname,
                            date_of_birth = EXCLUDED.date_of_birth,
                            nationality = EXCLUDED.nationality,
                            url = EXCLUDED.url,
                            permanent_number = EXCLUDED.permanent_number,
                            driver_championships = EXCLUDED.driver_championships,
                            constructor_championships = EXCLUDED.constructor_championships,
                            current_team = EXCLUDED.current_team,
                            is_active = EXCLUDED.is_active,
                            updated_at = NOW()
                    """)
                    
                    db.execute(query, {
                        "id": record_id,
                        "driver_id": driver_id_value,
                        "code": driver_data.get("code"),
                        "forename": driver_data["forename"],
                        "surname": driver_data["surname"],
                        "date_of_birth": driver_data.get("date_of_birth"),
                        "nationality": driver_data["nationality"],
                        "url": None,
                        "permanent_number": driver_data.get("permanent_number"),
                        "driver_championships": driver_data.get("driver_championships", 0),
                        "constructor_championships": driver_data.get("constructor_championships", 0),
                        "current_team": driver_data.get("current_team"),
                        "is_active": driver_data.get("is_active", True),
                    })
                    synced_count += 1
                except Exception as e:
                    error_msg = f"Error syncing driver {driver_data.get('driver_id')}: {str(e)}"
                    logger.error(error_msg)
                    errors.append(error_msg)
            
            # Mark drivers not in the confirmed lineup as inactive (only for current/future seasons with filtering enabled)
            # This handles cases where drivers are no longer in the lineup (e.g., MAG, ZHO, TSU, DOO)
            target_season = request.season if request.season is not None else (request.seasons[0] if request.seasons else CURRENT_SEASON)
            should_filter = request.filter_confirmed if request.filter_confirmed is not None else True
            
            if target_season >= CURRENT_SEASON and should_filter:
                confirmed_driver_codes = [code.upper() for code in CONFIRMED_2026_DRIVERS]
                
                # Mark drivers with codes not in confirmed list as inactive
                # Also deactivate drivers with numeric codes (old format) or codes that don't match
                # Build parameterized query with proper IN clause
                if confirmed_driver_codes:
                    # Create placeholders for IN clause
                    placeholders = ', '.join([f':code_{i}' for i in range(len(confirmed_driver_codes))])
                    params = {f'code_{i}': code for i, code in enumerate(confirmed_driver_codes)}
                    
                    deactivate_query = text(f"""
                        UPDATE drivers 
                        SET is_active = false, updated_at = NOW()
                        WHERE is_active = true
                        AND (
                            -- Code is numeric (old format, should be 3-letter)
                            (code IS NOT NULL AND code ~ '^[0-9]+$')
                            OR
                            -- Code is not in confirmed list (3-letter codes only)
                            (code IS NOT NULL AND LENGTH(code) = 3 AND UPPER(code) NOT IN ({placeholders}))
                        )
                    """)
                    
                    try:
                        result = db.execute(deactivate_query, params)
                        deactivated_count = result.rowcount
                        if deactivated_count > 0:
                            logger.info(f"Marked {deactivated_count} drivers as inactive (not in {target_season} confirmed lineup or invalid format)")
                    except Exception as e:
                        logger.warning(f"Could not deactivate old drivers: {e}")
            
            db.commit()
        except Exception as e:
            db.rollback()
            logger.error(f"Database error during sync: {e}")
            raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
        finally:
            db.close()
        
        logger.info(f"Successfully synced {synced_count} drivers")
        
        return DriverSyncResponse(
            success=True,
            message=f"Synced {synced_count} drivers",
            drivers_synced=synced_count,
            errors=errors if errors else None,
        )
        
    except Exception as e:
        logger.error(f"Error in driver sync: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/info")
async def get_service_info():
    """Get service information."""
    from app.config import SERVICE_NAME, SERVICE_VERSION
    
    return {
        "service": SERVICE_NAME,
        "version": SERVICE_VERSION,
        "status": "operational",
    }


@router.post("/drivers/debug")
async def debug_fastf1_drivers(request: DriverSyncRequest):
    """
    Debug endpoint to see raw FastF1 data without saving to database.
    Use this to inspect what FastF1 is actually returning.
    
    Example requests:
    - {"season": 2025} - Fetch 2025 drivers
    - {"season": 2026, "filter_confirmed": false} - Fetch all 2026 drivers (including test drivers)
    - {"seasons": [2024, 2025]} - Fetch multiple seasons
    """
    try:
        logger.info(f"Starting debug driver fetch from FastF1 - season: {request.season}, seasons: {request.seasons}, filter_confirmed: {request.filter_confirmed}")
        
        # Fetch drivers from FastF1 (run in thread pool to avoid blocking)
        import asyncio
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(
            None,
            sync_drivers,
            request.seasons,
            request.season,
            request.filter_confirmed if request.filter_confirmed is not None else True
        )
        
        return {
            "success": True,
            "message": "Raw FastF1 data (not saved to database)",
            "data": result,
            "drivers_count": len(result.get("drivers", [])),
            "drivers": result.get("drivers", []),
            "seasons_processed": result.get("seasons_processed", 0),
            "request_params": {
                "season": request.season,
                "seasons": request.seasons,
                "filter_confirmed": request.filter_confirmed,
            }
        }
        
    except Exception as e:
        logger.error(f"Error in debug driver fetch: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/teams", response_model=TeamSyncResponse)
async def sync_teams_endpoint(request: TeamSyncRequest):
    """Sync teams from FastF1 to database."""
    try:
        logger.info("Starting team sync")
        
        # Fetch teams from FastF1 (run in thread pool to avoid blocking)
        import asyncio
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(
            None, 
            sync_teams, 
            request.seasons,
            request.season
        )
        teams = result["teams"]
        
        if not teams:
            return TeamSyncResponse(
                success=False,
                message="No teams found to sync",
                teams_synced=0,
            )
        
        # Insert/update teams in database
        db = SessionLocal()
        errors = []
        synced_count = 0
        
        try:
            # First, clean up any duplicate constructors before syncing
            # Find duplicates by constructor_id and keep only the most recent
            cleanup_query = text("""
                WITH duplicates AS (
                    SELECT 
                        constructor_id,
                        COUNT(*) as count,
                        MAX(updated_at) as latest_update
                    FROM constructors
                    GROUP BY constructor_id
                    HAVING COUNT(*) > 1
                ),
                to_delete AS (
                    SELECT c.id
                    FROM constructors c
                    INNER JOIN duplicates dup ON c.constructor_id = dup.constructor_id
                    WHERE c.updated_at < dup.latest_update
                )
                DELETE FROM constructors
                WHERE id IN (SELECT id FROM to_delete)
            """)
            
            try:
                cleanup_result = db.execute(cleanup_query)
                deleted_count = cleanup_result.rowcount
                if deleted_count > 0:
                    logger.info(f"Cleaned up {deleted_count} duplicate constructor entries before sync")
            except Exception as e:
                logger.warning(f"Could not clean up duplicates: {e}")
            
            for team_data in teams:
                try:
                    constructor_id_value = team_data["constructor_id"]
                    
                    # Check if constructor exists by constructor_id
                    check_query = text("SELECT id FROM constructors WHERE constructor_id = :constructor_id")
                    existing_row = db.execute(check_query, {"constructor_id": constructor_id_value}).fetchone()
                    
                    # Generate ID: use existing if found, otherwise generate new UUID
                    record_id = existing_row[0] if existing_row else str(uuid.uuid4())
                    
                    # Use raw SQL for upsert (PostgreSQL)
                    query = text("""
                        INSERT INTO constructors (
                            id, constructor_id, name, nationality, url, created_at, updated_at
                        )
                        VALUES (
                            :id, :constructor_id, :name, :nationality, :url, NOW(), NOW()
                        )
                        ON CONFLICT (constructor_id) DO UPDATE SET
                            name = EXCLUDED.name,
                            nationality = EXCLUDED.nationality,
                            updated_at = NOW()
                    """)
                    
                    db.execute(query, {
                        "id": record_id,
                        "constructor_id": constructor_id_value,
                        "name": team_data["name"],
                        "nationality": team_data["nationality"],
                        "url": None,
                    })
                    synced_count += 1
                except Exception as e:
                    error_msg = f"Error syncing team {team_data.get('constructor_id')}: {str(e)}"
                    logger.error(error_msg)
                    errors.append(error_msg)
            
            db.commit()
        except Exception as e:
            db.rollback()
            logger.error(f"Database error during sync: {e}")
            raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
        finally:
            db.close()
        
        logger.info(f"Successfully synced {synced_count} teams")
        
        return TeamSyncResponse(
            success=True,
            message=f"Synced {synced_count} teams",
            teams_synced=synced_count,
            errors=errors if errors else None,
        )
        
    except Exception as e:
        logger.error(f"Error in team sync: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/lineups", response_model=LineupSyncResponse)
async def sync_lineups_endpoint(request: LineupSyncRequest):
    """
    Sync driver and constructor lineups for a season.
    Fetches lineup data from FastF1 API and stores as JSON (one row per season).
    """
    try:
        logger.info(f"Starting lineup sync for season {request.season}")
        
        import asyncio
        import json
        from collections import defaultdict
        
        loop = asyncio.get_event_loop()
        
        driver_lineups = []
        constructor_lineups = []
        errors = []
        
        # Fetch lineup data from FastF1
        try:
            logger.info(f"Fetching driver lineup for season {request.season}")
            driver_lineups = await loop.run_in_executor(None, get_season_driver_lineup, request.season)
            logger.info(f"Successfully fetched {len(driver_lineups)} driver lineups")
            
            logger.info(f"Fetching constructor lineup for season {request.season}")
            constructor_lineups = await loop.run_in_executor(None, get_season_constructor_lineup, request.season)
            logger.info(f"Successfully fetched {len(constructor_lineups)} constructor lineups")
        except Exception as fetch_error:
            logger.error(f"Failed to fetch lineup data: {fetch_error}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to fetch lineup data from FastF1: {str(fetch_error)}"
            )
        
        if not driver_lineups and not constructor_lineups:
            message = f"No lineup data available for season {request.season}. Please ensure the season exists and drivers/constructors are available."
            return LineupSyncResponse(
                success=True,
                message=message,
                drivers_synced=0,
                constructors_synced=0,
                errors=errors if errors else None,
            )
        
        # Process driver lineups - group by team
        teams_dict = defaultdict(list)
        for lineup in driver_lineups:
            team_name = lineup.get("team_name", "Unknown")
            teams_dict[team_name].append({
                "driverId": lineup["driver_id"],
                "driverNumber": lineup.get("driver_number"),
            })
        
        # Create JSON structure for drivers
        driver_lineup_json = {
            "teams": [
                {
                    "teamName": team_name,
                    "drivers": drivers
                }
                for team_name, drivers in sorted(teams_dict.items())
            ]
        }
        
        # Process constructor lineups - extract constructor IDs
        constructor_ids = [lineup["constructor_id"] for lineup in constructor_lineups]
        
        # Upsert to database
        db = SessionLocal()
        driver_synced = 0
        constructor_synced = 0
        
        try:
            # Upsert driver lineup (single row per season)
            if driver_lineup_json["teams"]:
                db.execute(text("""
                    INSERT INTO driver_season_lineups (id, season, lineup, created_at, updated_at)
                    VALUES (:id, :season, CAST(:lineup AS jsonb), NOW(), NOW())
                    ON CONFLICT (season)
                    DO UPDATE SET
                        lineup = EXCLUDED.lineup,
                        updated_at = NOW()
                """), {
                    "id": str(uuid.uuid4()),
                    "season": request.season,
                    "lineup": json.dumps(driver_lineup_json),
                })
                driver_synced = len(driver_lineups)
                logger.info(f"Stored driver lineup for season {request.season} with {len(driver_lineup_json['teams'])} teams")
            
            # Upsert constructor lineup (single row per season)
            if constructor_ids:
                db.execute(text("""
                    INSERT INTO constructor_season_lineups (id, season, constructors, created_at, updated_at)
                    VALUES (:id, :season, CAST(:constructors AS jsonb), NOW(), NOW())
                    ON CONFLICT (season)
                    DO UPDATE SET
                        constructors = EXCLUDED.constructors,
                        updated_at = NOW()
                """), {
                    "id": str(uuid.uuid4()),
                    "season": request.season,
                    "constructors": json.dumps(constructor_ids),
                })
                constructor_synced = len(constructor_ids)
                logger.info(f"Stored constructor lineup for season {request.season} with {len(constructor_ids)} constructors")
            
            db.commit()
        except Exception as e:
            db.rollback()
            logger.error(f"Database error during lineup sync: {e}")
            raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
        finally:
            db.close()
        
        logger.info(f"Successfully synced lineup for season {request.season}: {driver_synced} drivers across {len(driver_lineup_json['teams'])} teams, {constructor_synced} constructors")
        
        return LineupSyncResponse(
            success=True,
            message=f"Synced {driver_synced} drivers and {constructor_synced} constructors for season {request.season}",
            drivers_synced=driver_synced,
            constructors_synced=constructor_synced,
            errors=errors if errors else None,
        )
        
    except Exception as e:
        logger.error(f"Error in lineup sync: {e}")
        raise HTTPException(status_code=500, detail=str(e))
