-- CreateTable
CREATE TABLE "AuditLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER,
    "actionType" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" INTEGER,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" TEXT,
    "status" TEXT,
    "request" TEXT,
    "response" TEXT,
    "chargingStationId" INTEGER,
    CONSTRAINT "AuditLog_chargingStationId_fkey" FOREIGN KEY ("chargingStationId") REFERENCES "ChargingStation" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "AuditLog_chargingStationId_idx" ON "AuditLog"("chargingStationId");

-- CreateIndex
CREATE INDEX "AuditLog_timestamp_idx" ON "AuditLog"("timestamp");
