-- CreateEnum
CREATE TYPE "MemCateLast" AS ENUM ('ONEMONTH', 'THREEMONTH', 'SIXMONTH', 'FOREVER');

-- CreateTable
CREATE TABLE "Customer" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MemberShipCategory" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "last" "MemCateLast" NOT NULL,
    "discount" DECIMAL(3,2) NOT NULL,

    CONSTRAINT "MemberShipCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MemberShip" (
    "id" SERIAL NOT NULL,
    "memCateId" INTEGER NOT NULL,
    "customerId" INTEGER NOT NULL,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3),

    CONSTRAINT "MemberShip_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Customer_userId_key" ON "Customer"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "MemberShipCategory_name_key" ON "MemberShipCategory"("name");

-- AddForeignKey
ALTER TABLE "MemberShip" ADD CONSTRAINT "MemberShip_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberShip" ADD CONSTRAINT "MemberShip_memCateId_fkey" FOREIGN KEY ("memCateId") REFERENCES "MemberShipCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
