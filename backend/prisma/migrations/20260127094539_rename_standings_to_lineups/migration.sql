/*
  Warnings:

  - You are about to drop the `constructor_season_standings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `driver_season_standings` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "constructor_season_standings" DROP CONSTRAINT "constructor_season_standings_constructor_id_fkey";

-- DropForeignKey
ALTER TABLE "driver_season_standings" DROP CONSTRAINT "driver_season_standings_driver_id_fkey";

-- DropTable
DROP TABLE "constructor_season_standings";

-- DropTable
DROP TABLE "driver_season_standings";

-- CreateTable
CREATE TABLE "driver_season_lineups" (
    "id" TEXT NOT NULL,
    "season" INTEGER NOT NULL,
    "driver_id" TEXT NOT NULL,
    "team_name" TEXT NOT NULL,
    "driver_number" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "driver_season_lineups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "constructor_season_lineups" (
    "id" TEXT NOT NULL,
    "season" INTEGER NOT NULL,
    "constructor_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "constructor_season_lineups_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "driver_season_lineups_season_idx" ON "driver_season_lineups"("season");

-- CreateIndex
CREATE INDEX "driver_season_lineups_driver_id_idx" ON "driver_season_lineups"("driver_id");

-- CreateIndex
CREATE UNIQUE INDEX "driver_season_lineups_season_driver_id_key" ON "driver_season_lineups"("season", "driver_id");

-- CreateIndex
CREATE INDEX "constructor_season_lineups_season_idx" ON "constructor_season_lineups"("season");

-- CreateIndex
CREATE INDEX "constructor_season_lineups_constructor_id_idx" ON "constructor_season_lineups"("constructor_id");

-- CreateIndex
CREATE UNIQUE INDEX "constructor_season_lineups_season_constructor_id_key" ON "constructor_season_lineups"("season", "constructor_id");

-- AddForeignKey
ALTER TABLE "driver_season_lineups" ADD CONSTRAINT "driver_season_lineups_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "drivers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "constructor_season_lineups" ADD CONSTRAINT "constructor_season_lineups_constructor_id_fkey" FOREIGN KEY ("constructor_id") REFERENCES "constructors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
