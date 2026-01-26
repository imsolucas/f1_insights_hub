"""Sync endpoints for FastF1 data."""
from fastapi import APIRouter, HTTPException
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from app.config import DATABASE_URL
from app.schemas.driver import DriverSyncRequest, DriverSyncResponse
from app.services.fastf1_service import sync_drivers
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
        result = await loop.run_in_executor(None, sync_drivers, request.seasons)
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
            for driver_data in drivers:
                try:
                    driver_id_value = driver_data["driver_id"]
                    
                    # Check if driver exists to get existing ID
                    check_query = text("SELECT id FROM drivers WHERE driver_id = :driver_id")
                    existing_row = db.execute(check_query, {"driver_id": driver_id_value}).fetchone()
                    
                    # Generate ID: use existing if found, otherwise generate new UUID
                    record_id = existing_row[0] if existing_row else str(uuid.uuid4())
                    
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
