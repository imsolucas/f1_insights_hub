-- CreateTable
CREATE TABLE "driver_season_standings" (
    "id" TEXT NOT NULL,
    "season" INTEGER NOT NULL,
    "round" INTEGER NOT NULL,
    "driver_id" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "points" DOUBLE PRECISION NOT NULL,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "driver_season_standings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "constructor_season_standings" (
    "id" TEXT NOT NULL,
    "season" INTEGER NOT NULL,
    "round" INTEGER NOT NULL,
    "constructor_id" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "points" DOUBLE PRECISION NOT NULL,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "constructor_season_standings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "driver_season_standings_season_round_idx" ON "driver_season_standings"("season", "round");

-- CreateIndex
CREATE INDEX "driver_season_standings_driver_id_idx" ON "driver_season_standings"("driver_id");

-- CreateIndex
CREATE INDEX "driver_season_standings_season_driver_id_idx" ON "driver_season_standings"("season", "driver_id");

-- CreateIndex
CREATE UNIQUE INDEX "driver_season_standings_season_round_driver_id_key" ON "driver_season_standings"("season", "round", "driver_id");

-- CreateIndex
CREATE INDEX "constructor_season_standings_season_round_idx" ON "constructor_season_standings"("season", "round");

-- CreateIndex
CREATE INDEX "constructor_season_standings_constructor_id_idx" ON "constructor_season_standings"("constructor_id");

-- CreateIndex
CREATE INDEX "constructor_season_standings_season_constructor_id_idx" ON "constructor_season_standings"("season", "constructor_id");

-- CreateIndex
CREATE UNIQUE INDEX "constructor_season_standings_season_round_constructor_id_key" ON "constructor_season_standings"("season", "round", "constructor_id");

-- AddForeignKey
ALTER TABLE "driver_season_standings" ADD CONSTRAINT "driver_season_standings_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "drivers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "constructor_season_standings" ADD CONSTRAINT "constructor_season_standings_constructor_id_fkey" FOREIGN KEY ("constructor_id") REFERENCES "constructors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
