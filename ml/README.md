# F1 Insight Hub ML Service

Python FastAPI service for FastF1 data synchronization.

## Setup

### Prerequisites

- Python 3.11+
- PostgreSQL database (connection string in `DATABASE_URL`)

### Installation

1. Create a virtual environment:

```bash
python3 -m venv venv
```

2. Activate the virtual environment:

```bash
# On Linux/Mac:
source venv/bin/activate

# On Windows:
venv\Scripts\activate
```

3. Install dependencies:

```bash
pip install -r requirements.txt
```

4. Copy environment variables:

```bash
cp .env.example .env
```

5. Update `.env` with your database URL and other settings.

## Running Locally

### Option 1: Direct (Recommended for ML service only)

```bash
# Activate virtual environment first
source venv/bin/activate  # Linux/Mac
# or
venv\Scripts\activate     # Windows

# Then run
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Option 2: Via pnpm (from project root)

**Important:** You must activate the virtual environment first, then run:

```bash
# Activate venv
cd ml
source venv/bin/activate
cd ..

# Then from project root:
pnpm dev
```

The service will be available at `http://localhost:8000`

**Note:** When running `pnpm dev` from the root, Turbo will start all services (frontend, backend, ml) in parallel. Make sure the ML venv is activated in your terminal session first.

## Endpoints

- `GET /health` - Health check
- `GET /api/sync/info` - Service information
- `POST /api/sync/drivers` - Sync drivers from FastF1

## Development

The service uses FastF1 to fetch F1 data and sync it to PostgreSQL. FastF1 caches data locally in the `FASTF1_CACHE_DIR` directory.

## Deployment

See `Dockerfile` and `render.yaml` for deployment configurations.
