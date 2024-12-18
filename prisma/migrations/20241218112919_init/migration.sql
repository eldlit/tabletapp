-- CreateEnum
DROP TYPE IF EXISTS "ItemStatus";
CREATE TYPE "ItemStatus" AS ENUM ('AVAILABLE', 'UNAVAILABLE', 'ARCHIVE');

-- CreateTable
CREATE TABLE "recommendation" (
    "id" TEXT NOT NULL,
    "sourceItemId" TEXT NOT NULL,
    "recommendedItemId" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menu_item" (
    "id" TEXT NOT NULL,
    "title" JSONB NOT NULL,
    "subtitle" JSONB,
    "price" TEXT NOT NULL,
    "foodKey" TEXT NOT NULL,
    "showDuringBreakfast" BOOLEAN NOT NULL DEFAULT false,
    "dietaryInfo" JSONB,
    "category_id" TEXT NOT NULL,
    "restaurant_id" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" "ItemStatus" NOT NULL DEFAULT 'AVAILABLE',

    CONSTRAINT "menu_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category_type" TEXT NOT NULL,
    "order_index" INTEGER NOT NULL,
    "restaurant_id" TEXT NOT NULL,
    "creation_timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_timestamp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "restaurant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "settings" JSONB,
    "operating_hours" JSONB NOT NULL,
    "creation_timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_timestamp" TIMESTAMP(3) NOT NULL,
    "owner_id" TEXT NOT NULL,

    CONSTRAINT "restaurant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_table" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "user_type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_table_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "recommendation_sourceItemId_recommendedItemId_key" ON "recommendation"("sourceItemId", "recommendedItemId");

-- CreateIndex
CREATE INDEX "menu_item_category_id_idx" ON "menu_item"("category_id");

-- CreateIndex
CREATE INDEX "menu_item_id_idx" ON "menu_item"("id");

-- CreateIndex
CREATE UNIQUE INDEX "user_table_username_key" ON "user_table"("username");

-- AddForeignKey
ALTER TABLE "recommendation" ADD CONSTRAINT "recommendation_sourceItemId_fkey" FOREIGN KEY ("sourceItemId") REFERENCES "menu_item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommendation" ADD CONSTRAINT "recommendation_recommendedItemId_fkey" FOREIGN KEY ("recommendedItemId") REFERENCES "menu_item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_item" ADD CONSTRAINT "menu_item_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_item" ADD CONSTRAINT "menu_item_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "category" ADD CONSTRAINT "category_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restaurant" ADD CONSTRAINT "restaurant_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "user_table"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
