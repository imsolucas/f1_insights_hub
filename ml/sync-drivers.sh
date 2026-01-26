#!/bin/bash
# Script to sync drivers from FastF1 to database

echo "Syncing drivers from FastF1..."

# Call the sync endpoint
curl -X POST http://localhost:8000/api/sync/drivers \
  -H "Content-Type: application/json" \
  -d '{"seasons": [2024, 2025]}' \
  | python3 -m json.tool

echo ""
echo "Sync complete!"
