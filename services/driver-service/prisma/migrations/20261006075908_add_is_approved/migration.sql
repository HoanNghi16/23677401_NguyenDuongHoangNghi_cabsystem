/*
  Warnings:

  - The values [PENDING] on the enum `DriverStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "DriverStatus_new" AS ENUM ('OFFLINE', 'READY', 'BUSY');
ALTER TABLE "public"."Driver" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Driver" ALTER COLUMN "status" TYPE "DriverStatus_new" USING ("status"::text::"DriverStatus_new");
ALTER TYPE "DriverStatus" RENAME TO "DriverStatus_old";
ALTER TYPE "DriverStatus_new" RENAME TO "DriverStatus";
DROP TYPE "public"."DriverStatus_old";
ALTER TABLE "Driver" ALTER COLUMN "status" SET DEFAULT 'OFFLINE';
COMMIT;

-- AlterTable
ALTER TABLE "Driver" ADD COLUMN     "isApproved" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "status" SET DEFAULT 'OFFLINE';
