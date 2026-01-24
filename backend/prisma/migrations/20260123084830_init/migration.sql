-- CreateTable
CREATE TABLE "drivers" (
    "id" TEXT NOT NULL,
    "driver_id" TEXT NOT NULL,
    "code" TEXT,
    "forename" TEXT NOT NULL,
    "surname" TEXT NOT NULL,
    "date_of_birth" TIMESTAMP(3),
    "nationality" TEXT NOT NULL,
    "url" TEXT,
    "permanent_number" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "drivers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "constructors" (
    "id" TEXT NOT NULL,
    "constructor_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nationality" TEXT NOT NULL,
    "url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "constructors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "circuits" (
    "id" TEXT NOT NULL,
    "circuit_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "lat" DOUBLE PRECISION,
    "long" DOUBLE PRECISION,
    "alt" INTEGER,
    "url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "circuits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seasons" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seasons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "races" (
    "id" TEXT NOT NULL,
    "season" INTEGER NOT NULL,
    "round" INTEGER NOT NULL,
    "race_name" TEXT NOT NULL,
    "circuit_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "time" TEXT,
    "url" TEXT,
    "sprint_date" TIMESTAMP(3),
    "sprint_time" TEXT,
    "qualifying_date" TIMESTAMP(3),
    "qualifying_time" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "races_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "race_results" (
    "id" TEXT NOT NULL,
    "race_id" TEXT NOT NULL,
    "driver_id" TEXT NOT NULL,
    "constructor_id" TEXT NOT NULL,
    "position" INTEGER,
    "points" DOUBLE PRECISION NOT NULL,
    "grid" INTEGER,
    "laps" INTEGER,
    "status" TEXT NOT NULL,
    "time" TEXT,
    "milliseconds" INTEGER,
    "fastest_lap" INTEGER,
    "fastest_lap_time" TEXT,
    "fastest_lap_speed" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "race_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qualifying_results" (
    "id" TEXT NOT NULL,
    "race_id" TEXT NOT NULL,
    "driver_id" TEXT NOT NULL,
    "constructor_id" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "q1" TEXT,
    "q2" TEXT,
    "q3" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "qualifying_results_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "drivers_driver_id_key" ON "drivers"("driver_id");

-- CreateIndex
CREATE INDEX "drivers_driver_id_idx" ON "drivers"("driver_id");

-- CreateIndex
CREATE UNIQUE INDEX "constructors_constructor_id_key" ON "constructors"("constructor_id");

-- CreateIndex
CREATE INDEX "constructors_constructor_id_idx" ON "constructors"("constructor_id");

-- CreateIndex
CREATE UNIQUE INDEX "circuits_circuit_id_key" ON "circuits"("circuit_id");

-- CreateIndex
CREATE INDEX "circuits_circuit_id_idx" ON "circuits"("circuit_id");

-- CreateIndex
CREATE UNIQUE INDEX "seasons_year_key" ON "seasons"("year");

-- CreateIndex
CREATE INDEX "seasons_year_idx" ON "seasons"("year");

-- CreateIndex
CREATE INDEX "races_season_idx" ON "races"("season");

-- CreateIndex
CREATE INDEX "races_circuit_id_idx" ON "races"("circuit_id");

-- CreateIndex
CREATE INDEX "races_date_idx" ON "races"("date");

-- CreateIndex
CREATE UNIQUE INDEX "races_season_round_key" ON "races"("season", "round");

-- CreateIndex
CREATE INDEX "race_results_race_id_idx" ON "race_results"("race_id");

-- CreateIndex
CREATE INDEX "race_results_driver_id_idx" ON "race_results"("driver_id");

-- CreateIndex
CREATE INDEX "race_results_constructor_id_idx" ON "race_results"("constructor_id");

-- CreateIndex
CREATE INDEX "race_results_race_id_driver_id_idx" ON "race_results"("race_id", "driver_id");

-- CreateIndex
CREATE INDEX "qualifying_results_race_id_idx" ON "qualifying_results"("race_id");

-- CreateIndex
CREATE INDEX "qualifying_results_driver_id_idx" ON "qualifying_results"("driver_id");

-- CreateIndex
CREATE INDEX "qualifying_results_race_id_driver_id_idx" ON "qualifying_results"("race_id", "driver_id");

-- AddForeignKey
ALTER TABLE "races" ADD CONSTRAINT "races_circuit_id_fkey" FOREIGN KEY ("circuit_id") REFERENCES "circuits"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "race_results" ADD CONSTRAINT "race_results_race_id_fkey" FOREIGN KEY ("race_id") REFERENCES "races"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "race_results" ADD CONSTRAINT "race_results_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "drivers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "race_results" ADD CONSTRAINT "race_results_constructor_id_fkey" FOREIGN KEY ("constructor_id") REFERENCES "constructors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qualifying_results" ADD CONSTRAINT "qualifying_results_race_id_fkey" FOREIGN KEY ("race_id") REFERENCES "races"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qualifying_results" ADD CONSTRAINT "qualifying_results_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "drivers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qualifying_results" ADD CONSTRAINT "qualifying_results_constructor_id_fkey" FOREIGN KEY ("constructor_id") REFERENCES "constructors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
