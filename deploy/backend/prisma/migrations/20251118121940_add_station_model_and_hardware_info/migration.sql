-- CreateTable
CREATE TABLE "StationModel" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "vendor" TEXT,
    "powerOutputKw" REAL,
    "maxCurrentAmp" REAL,
    "maxVoltageV" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ChargingStation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ocppIdentifier" TEXT NOT NULL,
    "vendor" TEXT,
    "model" TEXT,
    "firmwareVersion" TEXT,
    "serialNumber" TEXT,
    "status" TEXT,
    "lastHeartbeatAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "powerOutputKw" REAL,
    "maxCurrentAmp" REAL,
    "maxVoltageV" REAL,
    "modelId" INTEGER,
    CONSTRAINT "ChargingStation_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "StationModel" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ChargingStation" ("createdAt", "firmwareVersion", "id", "lastHeartbeatAt", "model", "ocppIdentifier", "serialNumber", "status", "updatedAt", "vendor") SELECT "createdAt", "firmwareVersion", "id", "lastHeartbeatAt", "model", "ocppIdentifier", "serialNumber", "status", "updatedAt", "vendor" FROM "ChargingStation";
DROP TABLE "ChargingStation";
ALTER TABLE "new_ChargingStation" RENAME TO "ChargingStation";
CREATE UNIQUE INDEX "ChargingStation_ocppIdentifier_key" ON "ChargingStation"("ocppIdentifier");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "StationModel_name_key" ON "StationModel"("name");
