-- AlterTable: Drop foreign key constraints and indexes from driver_season_lineups
ALTER TABLE "driver_season_lineups" DROP CONSTRAINT IF EXISTS "driver_season_lineups_driver_id_fkey";
DROP INDEX IF EXISTS "driver_season_lineups_driver_id_idx";
DROP INDEX IF EXISTS "driver_season_lineups_season_driver_id_key";

-- AlterTable: Drop foreign key constraints and indexes from constructor_season_lineups
ALTER TABLE "constructor_season_lineups" DROP CONSTRAINT IF EXISTS "constructor_season_lineups_constructor_id_fkey";
DROP INDEX IF EXISTS "constructor_season_lineups_constructor_id_idx";
DROP INDEX IF EXISTS "constructor_season_lineups_season_constructor_id_key";

-- Backup existing data before restructure (optional - for safety)
CREATE TEMP TABLE driver_lineup_backup AS SELECT * FROM "driver_season_lineups";
CREATE TEMP TABLE constructor_lineup_backup AS SELECT * FROM "constructor_season_lineups";

-- Drop and recreate driver_season_lineups table with new structure
DROP TABLE "driver_season_lineups";

CREATE TABLE "driver_season_lineups" (
    "id" TEXT NOT NULL,
    "season" INTEGER NOT NULL,
    "lineup" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "driver_season_lineups_pkey" PRIMARY KEY ("id")
);

-- Create unique index on season
CREATE UNIQUE INDEX "driver_season_lineups_season_key" ON "driver_season_lineups"("season");

-- Create index on season
CREATE INDEX "driver_season_lineups_season_idx" ON "driver_season_lineups"("season");

-- Drop and recreate constructor_season_lineups table with new structure
DROP TABLE "constructor_season_lineups";

CREATE TABLE "constructor_season_lineups" (
    "id" TEXT NOT NULL,
    "season" INTEGER NOT NULL,
    "constructors" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "constructor_season_lineups_pkey" PRIMARY KEY ("id")
);

-- Create unique index on season
CREATE UNIQUE INDEX "constructor_season_lineups_season_key" ON "constructor_season_lineups"("season");

-- Create index on season
CREATE INDEX "constructor_season_lineups_season_idx" ON "constructor_season_lineups"("season");
