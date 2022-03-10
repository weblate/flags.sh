-- CreateTable
CREATE TABLE "Share" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "urlHash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Options" (
    "shareId" INTEGER NOT NULL,
    "filename" TEXT NOT NULL,
    "memory" REAL NOT NULL,
    "pterodactyl" BOOLEAN NOT NULL,
    "modernVectors" BOOLEAN NOT NULL,
    "gui" BOOLEAN NOT NULL,
    "autoRestart" BOOLEAN NOT NULL,
    "flags" TEXT NOT NULL,
    "environment" TEXT NOT NULL,
    CONSTRAINT "Options_shareId_fkey" FOREIGN KEY ("shareId") REFERENCES "Share" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Share_urlHash_key" ON "Share"("urlHash");

-- CreateIndex
CREATE UNIQUE INDEX "Options_shareId_key" ON "Options"("shareId");
