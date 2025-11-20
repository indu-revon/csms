/*
  Warnings:

  - You are about to alter the column `ocppTransactionId` on the `ChargingSession` table. The data in that column could be lost. The data in that column will be cast from `Int` to `BigInt`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ChargingSession" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "chargingStationId" INTEGER NOT NULL,
    "connectorId" INTEGER NOT NULL,
    "ocppTransactionId" BIGINT NOT NULL,
    "ocppIdTag" TEXT NOT NULL,
    "startTimestamp" DATETIME NOT NULL,
    "stopTimestamp" DATETIME,
    "startMeterValue" INTEGER,
    "stopMeterValue" INTEGER,
    "energyKwh" REAL,
    "sessionStatus" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ChargingSession_chargingStationId_fkey" FOREIGN KEY ("chargingStationId") REFERENCES "ChargingStation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ChargingSession_connectorId_fkey" FOREIGN KEY ("connectorId") REFERENCES "Connector" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ChargingSession" ("chargingStationId", "connectorId", "createdAt", "energyKwh", "id", "ocppIdTag", "ocppTransactionId", "sessionStatus", "startMeterValue", "startTimestamp", "stopMeterValue", "stopTimestamp", "updatedAt") SELECT "chargingStationId", "connectorId", "createdAt", "energyKwh", "id", "ocppIdTag", "ocppTransactionId", "sessionStatus", "startMeterValue", "startTimestamp", "stopMeterValue", "stopTimestamp", "updatedAt" FROM "ChargingSession";
DROP TABLE "ChargingSession";
ALTER TABLE "new_ChargingSession" RENAME TO "ChargingSession";
CREATE UNIQUE INDEX "ChargingSession_chargingStationId_ocppTransactionId_key" ON "ChargingSession"("chargingStationId", "ocppTransactionId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
