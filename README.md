# F1 Insight Hub

A full-stack web application for Formula 1 fans to explore race data, statistics, predictions, and AI-generated insights.

## Project Structure

```
f1-insight-hub/
├── backend/          # Node.js/Express API
├── frontend/         # Next.js React application
├── ml/              # Python ML service (Phase 2+)
└── docs/            # Documentation
```

## Tech Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS 4, TanStack Query
- **Backend**: Node.js, Express, TypeScript, Prisma ORM
- **Database**: PostgreSQL
- **Monorepo**: Turborepo + pnpm workspaces
- **Deployment**: Vercel (frontend), Render (backend + DB)

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+
- PostgreSQL database (local or hosted)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd f1-insight-hub
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:

**Backend** (`backend/.env`):
```env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://user:pass@localhost:5432/f1_insight_hub
CORS_ORIGIN=http://localhost:3000
ERGAST_API_BASE_URL=https://ergast.com/api/f1
```

**Frontend** (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

4. Set up the database:

```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
```

5. Start the development servers:

```bash
# From root directory
pnpm dev

# Or separately:
pnpm dev:backend  # Backend on http://localhost:3001
pnpm dev:frontend # Frontend on http://localhost:3000
```

## Available Scripts

### Root Level (Turborepo)
- `pnpm dev` - Start all packages in dev mode (with caching)
- `pnpm build` - Build all packages (parallel with caching)
- `pnpm lint` - Lint all packages (parallel)
- `pnpm typecheck` - Type check all packages (parallel)
- `pnpm test` - Run tests across all packages
- `pnpm clean` - Clean all build artifacts

All scripts use Turborepo for:
- **Parallel execution** - Tasks run in parallel when possible
- **Caching** - Builds are cached for faster subsequent runs
- **Dependency graph** - Tasks respect package dependencies

### Backend
- `pnpm --filter backend dev` - Start backend dev server
- `pnpm --filter backend build` - Build backend
- `pnpm --filter backend prisma:generate` - Generate Prisma Client
- `pnpm --filter backend prisma:migrate` - Run migrations
- `pnpm --filter backend prisma:studio` - Open Prisma Studio

### Frontend
- `pnpm --filter frontend dev` - Start Next.js dev server
- `pnpm --filter frontend build` - Build Next.js app

## API Documentation

Interactive API documentation is available via Swagger UI when the backend server is running:

- **Swagger UI**: `http://localhost:3001/api-docs`

The Swagger documentation includes:
- All available endpoints with descriptions
- Request/response schemas
- Query parameters and path parameters
- Example requests and responses
- Try-it-out functionality for testing endpoints

## API Endpoints

### Races
- `GET /api/v1/races` - List all races
- `GET /api/v1/races/:raceId` - Get race details
- `GET /api/v1/races/:raceId/results` - Get race results
- `GET /api/v1/races/:raceId/qualifying` - Get qualifying results
- `GET /api/v1/races/current/schedule` - Get current season schedule

### Drivers
- `GET /api/v1/drivers` - List all drivers
- `GET /api/v1/drivers/:driverId` - Get driver details
- `GET /api/v1/drivers/:driverId/results` - Get driver results
- `GET /api/v1/drivers/:driverId/stats` - Get driver statistics

### Constructors/Teams
- `GET /api/v1/constructors` - List all constructors
- `GET /api/v1/constructors/:constructorId` - Get constructor details
- `GET /api/v1/constructors/:constructorId/results` - Get constructor results
- `GET /api/v1/constructors/:constructorId/stats` - Get constructor statistics

### Circuits
- `GET /api/v1/circuits` - List all circuits
- `GET /api/v1/circuits/:circuitId` - Get circuit details
- `GET /api/v1/circuits/:circuitId/races` - Get races at circuit

## Data Synchronization

The backend automatically syncs current season data from the Ergast API on server startup. To manually trigger a sync:

1. The sync runs automatically on server startup
2. Data is cached in the database to reduce API calls
3. Historical data is fetched on-demand when requested

## CI/CD Pipeline

Automated CI/CD is configured via GitHub Actions. The pipeline:

- **Verifies** code quality (typecheck, lint, build) on every push and PR
- **Deploys** to production (Vercel + Render) when code is pushed to `main` branch

See [CI/CD Setup Guide](./docs/ci-cd-setup.md) for detailed configuration instructions.

### Required GitHub Secrets

Configure these secrets in your GitHub repository (Settings → Secrets and variables → Actions):

**Backend (Render):**
- `RENDER_SERVICE_ID` - Your Render service ID
- `RENDER_API_KEY` - Your Render API key
- `DATABASE_URL` - PostgreSQL connection string (for Prisma Client generation)

**Frontend (Vercel):**
- `VERCEL_TOKEN` - Vercel authentication token
- `VERCEL_ORG_ID` - Vercel organization ID
- `VERCEL_PROJECT_ID` - Vercel project ID

## Production Deployment

**Quick Start Checklist:** See [Production Deployment Quick Start](./docs/production-quickstart.md)

**Complete Guide:** See [Production Deployment Guide](./docs/production-deployment.md)

### Services Required

1. **Render** ([render.com](https://render.com)) - Free tier available
   - PostgreSQL database
   - Backend API (Node.js/Express)

2. **Vercel** ([vercel.com](https://vercel.com)) - Free tier available
   - Frontend (Next.js)

3. **GitHub** - For repository and CI/CD

### Deployment Steps Summary

1. **Database**: Create PostgreSQL on Render → Save connection string
2. **Backend**: Deploy web service on Render → Configure environment variables → Save Service ID & API key
3. **Frontend**: Import project to Vercel → Configure environment variables → Save Project ID, Org ID & token
4. **CI/CD**: Add GitHub secrets → Test workflow

## Deployment

### GitHub Actions CI/CD

The project includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that:

1. Runs verification (typecheck, lint, build) on all pushes
2. Deploys backend to Render on push to `main`
3. Deploys frontend to Vercel on push to `main`
4. Runs database migrations automatically

### Required GitHub Secrets

- `RENDER_API_KEY` - Render API key
- `RENDER_SERVICE_ID` - Render backend service ID
- `DATABASE_URL` - PostgreSQL connection string
- `VERCEL_TOKEN` - Vercel authentication token
- `VERCEL_ORG_ID` - Vercel organization ID
- `VERCEL_PROJECT_ID` - Vercel project ID

## Development Roadmap

### Phase 1 - MVP ✅
- [x] Database setup with Prisma
- [x] Ergast API integration
- [x] Backend REST API
- [x] Frontend pages (home, schedule, drivers, teams, circuits)
- [x] UI components
- [x] GitHub Actions CI/CD

### Phase 2 - ML Integration
- [ ] Python ML service setup
- [ ] Prediction models
- [ ] ML API endpoints

### Phase 3 - AI Features
- [ ] OpenAI integration
- [ ] Race summaries
- [ ] F1 chatbot

### Phase 4 - Polishing
- [ ] Advanced charts
- [ ] User authentication
- [ ] Performance optimizations

## License

ISC