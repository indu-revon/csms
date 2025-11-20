-- CreateTable
CREATE TABLE "ChargingStation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ocppIdentifier" TEXT NOT NULL,
    "vendor" TEXT,
    "model" TEXT,
    "firmwareVersion" TEXT,
    "serialNumber" TEXT,
    "status" TEXT,
    "lastHeartbeatAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Connector" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "chargingStationId" INTEGER NOT NULL,
    "connectorId" INTEGER NOT NULL,
    "status" TEXT,
    "lastStatusAt" DATETIME,
    "maxPowerKw" REAL,
    CONSTRAINT "Connector_chargingStationId_fkey" FOREIGN KEY ("chargingStationId") REFERENCES "ChargingStation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RfidCard" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tagId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "validFrom" DATETIME,
    "validUntil" DATETIME,
    "userId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ChargingSession" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "chargingStationId" INTEGER NOT NULL,
    "connectorId" INTEGER NOT NULL,
    "ocppTransactionId" INTEGER NOT NULL,
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

-- CreateTable
CREATE TABLE "MeterValue" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "chargingSessionId" INTEGER NOT NULL,
    "timestamp" DATETIME NOT NULL,
    "meterValue" INTEGER NOT NULL,
    "rawJson" TEXT,
    CONSTRAINT "MeterValue_chargingSessionId_fkey" FOREIGN KEY ("chargingSessionId") REFERENCES "ChargingSession" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Reservation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "chargingStationId" INTEGER NOT NULL,
    "connectorId" INTEGER,
    "ocppReservationId" INTEGER NOT NULL,
    "ocppIdTag" TEXT NOT NULL,
    "expiryDatetime" DATETIME NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Reservation_chargingStationId_fkey" FOREIGN KEY ("chargingStationId") REFERENCES "ChargingStation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ChargingStation_ocppIdentifier_key" ON "ChargingStation"("ocppIdentifier");

-- CreateIndex
CREATE UNIQUE INDEX "Connector_chargingStationId_connectorId_key" ON "Connector"("chargingStationId", "connectorId");

-- CreateIndex
CREATE UNIQUE INDEX "RfidCard_tagId_key" ON "RfidCard"("tagId");

-- CreateIndex
CREATE UNIQUE INDEX "ChargingSession_chargingStationId_ocppTransactionId_key" ON "ChargingSession"("chargingStationId", "ocppTransactionId");

-- CreateIndex
CREATE UNIQUE INDEX "Reservation_chargingStationId_ocppReservationId_key" ON "Reservation"("chargingStationId", "ocppReservationId");
