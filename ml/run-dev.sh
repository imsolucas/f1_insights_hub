#!/bin/bash
# Development script that ensures venv is activated

cd "$(dirname "$0")"

# Activate venv if it exists and not already activated
if [ -d "venv" ] && [ -z "$VIRTUAL_ENV" ]; then
    source venv/bin/activate
fi

# Run uvicorn
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
