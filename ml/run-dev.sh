#!/bin/bash
# Development script that ensures venv is activated

# Change to script directory (ml/)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Check if venv exists
if [ ! -d "venv" ]; then
    echo "Error: Virtual environment not found in $SCRIPT_DIR"
    echo "Please run: cd ml && ./setup.sh"
    exit 1
fi

# Activate venv if not already activated
if [ -z "$VIRTUAL_ENV" ]; then
    source venv/bin/activate
fi

# Verify Python is available
if ! command -v python &> /dev/null; then
    echo "Error: Python not found. Is the virtual environment activated?"
    exit 1
fi

# Run uvicorn
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
