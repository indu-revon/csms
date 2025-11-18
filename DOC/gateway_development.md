## 1. Architecture in Node.js + TypeScript

**Main components:**
- **OCPP WebSocket Server**  
  - Handles CP connections (OCPP 1.6J – JSON over WebSocket).
  - Parses OCPP frames, routes to handlers (BootNotification, Heartbeat, Authorize, etc.).
- **Business Logic Layer (Services)**  
  - Logic for stations, connectors, sessions, reservations, RFID auth, etc.
- **Data Access Layer (Repositories / ORM)**  
  - MySQL integration using an ORM (TypeORM or Prisma).
- **REST API (later)**  
  - For operator portal: list sessions, manual start/stop, reservations, etc.

---

## 2. Recommended Libraries & Tools

**Core:**
- **Language:** TypeScript
- **Runtime:** Node.js LTS (v20+)
- **Framework:** [NestJS](https://nestjs.com/)  
  - Gives you a structured architecture (modules, controllers, providers).
  - Handles WebSocket and REST APIs cleanly.

**WebSocket:**
- NestJS `@nestjs/websockets` with `ws` under the hood.

**Database:**
- **ORM:**  
  - **Prisma** (simple, type-safe, good DX), or  
  - **TypeORM** (very common with NestJS).
- **DB:** MySQL 8.x

**Other:**
- `class-transformer`, `class-validator` (DTO validation).
- `winston` or `pino` for logging.
- `dotenv` for configuration.

If you don’t want NestJS, you can do this with pure `ws` + Express, but NestJS will save time and keep things organized as project grows.

---

## 3. High-Level Project Structure (NestJS style)

```text
src/
  app.module.ts
  config/
    database.config.ts
    ocpp.config.ts
  ocpp/
    ocpp.module.ts
    ocpp.gateway.ts          // WebSocket server entrypoint
    ocpp.service.ts          // Routing OCPP actions to handlers
    dtos/                    // OCPP request/response DTOs
    handlers/
      boot-notification.handler.ts
      heartbeat.handler.ts
      status-notification.handler.ts
      authorize.handler.ts
      start-transaction.handler.ts
      stop-transaction.handler.ts
      meter-values.handler.ts
      reserve-now.handler.ts
      cancel-reservation.handler.ts
      ...
  charging/
    charging.module.ts
    stations/
      stations.service.ts
      stations.repository.ts
      station.entity.ts
    connectors/
      connectors.service.ts
      connectors.repository.ts
      connector.entity.ts
    sessions/
      sessions.service.ts
      sessions.repository.ts
      session.entity.ts
    meter-values/
      meter-values.service.ts
      meter-value.entity.ts
    reservations/
      reservations.service.ts
      reservation.entity.ts
    rfid/
      rfid.service.ts
      rfid-card.entity.ts
  api/
    api.module.ts
    controllers/
      stations.controller.ts
      sessions.controller.ts
      reservations.controller.ts
      rfid.controller.ts
      admin.controller.ts  // manual start/stop, etc.
  common/
    enums/
    exceptions/
    utils/
    types/
```

You can simplify this to start; the goal is just separation of concerns:
- `ocpp`: communication/protocol layer
- `charging`: business + data model
- `api`: REST interface

---

## 4. OCPP WebSocket Gateway (NestJS)

### 4.1 Basic Gateway Skeleton

```ts
// src/ocpp/ocpp.gateway.ts
import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, WebSocket } from 'ws';
import { OcppService } from './ocpp.service';

@WebSocketGateway({
  path: '/ocpp', // e.g., wss://yourdomain/ocpp
  transports: ['websocket'],
})
export class OcppGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly ocppService: OcppService) {}

  async handleConnection(client: WebSocket, req: any) {
    // CP ID usually comes from URL or headers
    // e.g. ws://host/ocpp/CP_12345
    const cpId = this.extractCpId(req.url);
    await this.ocppService.registerConnection(cpId, client);
  }

  async handleDisconnect(client: WebSocket) {
    await this.ocppService.handleDisconnect(client);
  }

  // Main message entrypoint
  async handleMessage(client: WebSocket, data: string) {
    // Parse OCPP frame: [messageTypeId, uniqueId, action, payload]
    await this.ocppService.handleIncomingMessage(client, data);
  }

  private extractCpId(url: string): string {
    // e.g. /ocpp/CP_123 → CP_123
    const parts = url.split('/');
    return parts[parts.length - 1];
  }
}
```

You’ll also need to bind `message` event on each connected socket (inside `registerConnection` or using NestJS built-in capabilities).

---

## 5. OCPP Service: Frame Routing

```ts
// src/ocpp/ocpp.service.ts
import { Injectable } from '@nestjs/common';
import { WebSocket } from 'ws';
import { BootNotificationHandler } from './handlers/boot-notification.handler';
import { HeartbeatHandler } from './handlers/heartbeat.handler';
// ...import other handlers

type OcppMessage = [number, string, string?, any?];

@Injectable()
export class OcppService {
  private cpConnections = new Map<string, WebSocket>();

  constructor(
    private readonly bootNotificationHandler: BootNotificationHandler,
    private readonly heartbeatHandler: HeartbeatHandler,
    // inject other handlers
  ) {}

  async registerConnection(cpId: string, client: WebSocket) {
    this.cpConnections.set(cpId, client);

    client.on('message', (raw: string) =>
      this.handleIncomingMessage(client, raw),
    );
  }

  async handleDisconnect(client: WebSocket) {
    for (const [cpId, sock] of this.cpConnections.entries()) {
      if (sock === client) {
        this.cpConnections.delete(cpId);
        // optionally mark station offline
        break;
      }
    }
  }

  async handleIncomingMessage(client: WebSocket, raw: string) {
    let msg: OcppMessage;
    try {
      msg = JSON.parse(raw);
    } catch {
      // invalid JSON; ignore or log
      return;
    }

    const [messageTypeId, uniqueId, actionOrPayload, payloadIfCall] = msg;

    switch (messageTypeId) {
      case 2: // CALL
        await this.handleCall(
          client,
          uniqueId,
          actionOrPayload as string,
          payloadIfCall,
        );
        break;
      case 3: // CALLRESULT
        // handle responses to messages you sent (RemoteStartTransaction, etc.)
        break;
      case 4: // CALLERROR
        // handle error
        break;
    }
  }

  private async handleCall(
    client: WebSocket,
    uniqueId: string,
    action: string,
    payload: any,
  ) {
    let responsePayload: any;

    switch (action) {
      case 'BootNotification':
        responsePayload = await this.bootNotificationHandler.handle(payload);
        break;
      case 'Heartbeat':
        responsePayload = await this.heartbeatHandler.handle(payload);
        break;
      // other cases: StatusNotification, Authorize, StartTransaction, etc.
      default:
        // Unknown action; respond with CALLERROR if you want.
        return;
    }

    const responseFrame: OcppMessage = [3, uniqueId, responsePayload];
    client.send(JSON.stringify(responseFrame));
  }
}
```

---

## 6. Example Handler: BootNotification

```ts
// src/ocpp/handlers/boot-notification.handler.ts
import { Injectable } from '@nestjs/common';
import { StationsService } from '../../charging/stations/stations.service';

interface BootNotificationReq {
  chargePointVendor: string;
  chargePointModel: string;
  chargePointSerialNumber?: string;
  firmwareVersion?: string;
  // ...other fields
}

interface BootNotificationConf {
  status: 'Accepted' | 'Rejected' | 'Pending';
  currentTime: string;
  interval: number;
}

@Injectable()
export class BootNotificationHandler {
  private readonly heartbeatInterval = 60; // seconds

  constructor(private readonly stationsService: StationsService) {}

  async handle(payload: BootNotificationReq): Promise<BootNotificationConf> {
    // You should know which CP this came from. You can attach cpId
    // to the WebSocket or via context; omitted here for brevity.

    // Example: create/update charging station record
    await this.stationsService.upsertStation({
      // cpId should be passed in or resolved
      vendor: payload.chargePointVendor,
      model: payload.chargePointModel,
      serialNumber: payload.chargePointSerialNumber,
      firmwareVersion: payload.firmwareVersion,
    });

    const now = new Date().toISOString();

    return {
      status: 'Accepted',
      currentTime: now,
      interval: this.heartbeatInterval,
    };
  }
}
```

---

## 7. Database Layer (Prisma Example)

**schema.prisma** (simplified):

```prisma
model ChargingStation {
  id               Int       @id @default(autoincrement())
  ocppIdentifier   String    @unique
  vendor           String?
  model            String?
  firmwareVersion  String?
  serialNumber     String?
  status           String?   // ONLINE/OFFLINE/etc.
  lastHeartbeatAt  DateTime?
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt

  connectors       Connector[]
  sessions         ChargingSession[]
  reservations     Reservation[]
}

model Connector {
  id               Int       @id @default(autoincrement())
  chargingStationId Int
  connectorId      Int
  status           String?
  lastStatusAt     DateTime?
  maxPowerKw       Float?

  chargingStation  ChargingStation @relation(fields: [chargingStationId], references: [id])
  sessions         ChargingSession[]
}

model RfidCard {
  id          Int      @id @default(autoincrement())
  tagId       String   @unique
  status      String   // Active/Blocked/Expired
  validFrom   DateTime?
  validUntil  DateTime?
  userId      Int?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model ChargingSession {
  id                 Int       @id @default(autoincrement())
  chargingStationId  Int
  connectorId        Int
  ocppTransactionId  Int
  ocppIdTag          String
  startTimestamp     DateTime
  stopTimestamp      DateTime?
  startMeterValue    Int?
  stopMeterValue     Int?
  energyKwh          Float?
  sessionStatus      String?
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  chargingStation    ChargingStation @relation(fields: [chargingStationId], references: [id])
  connector          Connector       @relation(fields: [connectorId], references: [id])
  meterValues        MeterValue[]
}

model MeterValue {
  id               Int       @id @default(autoincrement())
  chargingSessionId Int
  timestamp        DateTime
  meterValue       Int
  rawJson          Json?

  chargingSession  ChargingSession @relation(fields: [chargingSessionId], references: [id])
}

model Reservation {
  id               Int       @id @default(autoincrement())
  chargingStationId Int
  connectorId      Int?
  ocppReservationId Int
  ocppIdTag        String
  expiryDatetime   DateTime
  status           String
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  chargingStation  ChargingStation @relation(fields: [chargingStationId], references: [id])
}
```

Then write services like `StationsService` using Prisma client.

---

## 8. Initial Development Plan (Node/TS)

**Step 1 – Setup & Infrastructure**
- Initialize NestJS project.
- Configure TypeScript, ESLint, dotenv.
- Setup Prisma/TypeORM with MySQL; create initial schema.
- Implement `StationsService`, `ConnectorsService` basic CRUD.

**Step 2 – OCPP WebSocket & Core Messages**
- Implement `OcppGateway` + `OcppService`.
- Implement handlers for:
  - `BootNotification`
  - `Heartbeat`
  - `StatusNotification`
- Update DB fields properly (station status, connector status, lastHeartbeatAt).

**Step 3 – RFID & Transactions**
- Add `RfidCard` model + `RfidService`.
- Implement handlers:
  - `Authorize`
  - `StartTransaction`
  - `MeterValues`
  - `StopTransaction`
- Persist sessions and meter values as described.

**Step 4 – Reservations & Remote Control**
- Implement handlers:
  - `ReserveNow`
  - `CancelReservation`
- Implement sending Central → CP messages:
  - `RemoteStartTransaction`
  - `RemoteStopTransaction`
  - `ChangeAvailability`
- Add basic REST controllers for manual operations (operator portal).

