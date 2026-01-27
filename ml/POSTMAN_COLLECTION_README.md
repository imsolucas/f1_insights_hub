# F1 Insight Hub ML Service - Postman Collection

This Postman collection allows you to test the FastF1 sync API endpoints for the F1 Insight Hub ML service.

## Importing the Collection

1. Open Postman
2. Click **Import** button
3. Select the file: `F1_Insight_Hub_API.postman_collection.json`
4. The collection will appear in your Postman workspace

## Prerequisites

- ML service must be running on `http://localhost:8000`
- FastF1 cache directory must be configured
- Database connection must be properly configured

## Available Endpoints

### 1. Sync Drivers

#### Sync Current Season (2026) - Confirmed Only
- **Method**: POST
- **URL**: `http://localhost:8000/api/sync/drivers`
- **Body**:
  ```json
  {
    "season": 2026,
    "filter_confirmed": true
  }
  ```
- **Description**: Syncs only confirmed race drivers for 2026 season. Excludes test/reserve drivers (MAG, ZHO, TSU, DOO).

#### Sync 2025 Season
- **Method**: POST
- **URL**: `http://localhost:8000/api/sync/drivers`
- **Body**:
  ```json
  {
    "season": 2025,
    "filter_confirmed": false
  }
  ```
- **Description**: Syncs all drivers from 2025 season (includes test/reserve drivers).

#### Sync Multiple Seasons
- **Method**: POST
- **URL**: `http://localhost:8000/api/sync/drivers`
- **Body**:
  ```json
  {
    "seasons": [2024, 2025, 2026],
    "filter_confirmed": true
  }
  ```
- **Description**: Syncs drivers from multiple seasons.

#### Sync 2026 - All Drivers (No Filter)
- **Method**: POST
- **URL**: `http://localhost:8000/api/sync/drivers`
- **Body**:
  ```json
  {
    "season": 2026,
    "filter_confirmed": false
  }
  ```
- **Description**: Syncs all drivers from 2026 including test/reserve drivers. Useful for debugging.

### 2. Debug Endpoints

#### Debug - Get Raw FastF1 Data
- **Method**: POST
- **URL**: `http://localhost:8000/api/sync/drivers/debug`
- **Body**:
  ```json
  {
    "season": 2026,
    "filter_confirmed": true
  }
  ```
- **Description**: Returns raw FastF1 data without saving to database. Useful for inspecting what data FastF1 returns.

### 3. Service Info

#### Get Service Info
- **Method**: GET
- **URL**: `http://localhost:8000/api/sync/info`
- **Description**: Returns service information and status.

## Request Parameters

### DriverSyncRequest Schema

```json
{
  "season": 2026,              // Optional: Single season to sync (takes precedence over seasons)
  "seasons": [2024, 2025],    // Optional: List of seasons to sync
  "filter_confirmed": true     // Optional: Filter to confirmed drivers only (default: true)
}
```

**Notes**:
- If `season` is provided, it takes precedence over `seasons`
- If neither `season` nor `seasons` is provided, defaults to current season (2026)
- `filter_confirmed` only applies to current/future seasons (2026+)
- For historical seasons, `filter_confirmed` is ignored

## Response Format

### Success Response

```json
{
  "success": true,
  "message": "Synced 24 drivers",
  "drivers_synced": 24,
  "errors": null
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error message",
  "drivers_synced": 0,
  "errors": ["Error detail 1", "Error detail 2"]
}
```

## Debug Endpoint Response

The debug endpoint returns raw FastF1 data:

```json
{
  "success": true,
  "message": "Raw FastF1 data (not saved to database)",
  "data": {
    "drivers": [...],
    "seasons_processed": 1
  },
  "drivers_count": 24,
  "drivers": [...],
  "seasons_processed": 1,
  "request_params": {
    "season": 2026,
    "seasons": null,
    "filter_confirmed": true
  }
}
```

## Confirmed 2026 Drivers

The following drivers are confirmed for the 2026 season (used when `filter_confirmed: true`):

- **Alpine**: GAS (Gasly), COL (Colapinto)
- **Aston Martin**: ALO (Alonso), STR (Stroll)
- **Audi**: BOR (Bortoleto), HUL (Hulkenberg)
- **Cadillac**: PER (Pérez), BOT (Bottas)
- **Ferrari**: LEC (Leclerc), HAM (Hamilton)
- **Haas**: BEA (Bearman), OCO (Ocon)
- **McLaren**: NOR (Norris), PIA (Piastri)
- **Mercedes**: RUS (Russell), ANT (Antonelli)
- **Racing Bulls**: LAW (Lawson), LIN (Lindblad)
- **Red Bull Racing**: VER (Verstappen), HAD (Hadjar)
- **Williams**: SAI (Sainz), ALB (Albon)

**Excluded drivers** (not in 2026 lineup):
- MAG (Magnussen)
- ZHO (Zhou)
- TSU (Tsunoda)
- DOO (Doohan)

## Troubleshooting

### No drivers returned
- Check if the season has started (2026 may not have race data yet)
- Try `filter_confirmed: false` to see all drivers including test drivers
- Check ML service logs for FastF1 errors

### Duplicate drivers
- The service now includes improved duplicate detection
- Drivers are deduplicated by both `driver_id` and `code`
- If duplicates persist, check the debug endpoint to see raw data

### Session errors
- FastF1 may not have data for future seasons yet
- The service automatically falls back to previous season data
- Check FastF1 cache directory permissions

## Testing Workflow

1. **Start with Debug Endpoint**: Use `/api/sync/drivers/debug` to see what FastF1 returns
2. **Test with filter_confirmed: false**: See all drivers including test drivers
3. **Test with filter_confirmed: true**: See only confirmed race drivers
4. **Sync to Database**: Use `/api/sync/drivers` to save data
5. **Verify**: Check your database to confirm drivers were synced correctly
