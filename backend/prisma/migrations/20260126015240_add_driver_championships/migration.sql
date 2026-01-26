-- AlterTable
ALTER TABLE "drivers" ADD COLUMN     "constructor_championships" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "current_team" TEXT,
ADD COLUMN     "driver_championships" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true;
