# OCPP Gateway - Setup and Usage Instructions

## Overview

This OCPP 1.6J Gateway enables communication between electric vehicle charging stations and the central management system via WebSocket protocol.

## Prerequisites

- Node.js v18+
- npm or yarn
- SQLite (automatically included)

## Installation

### 1. Install Dependencies

```bash
cd D:\workspace\REVON_CMSV3\OCPP_GATEWAY
npm install
```

### 2. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy
```

### 3. Environment Configuration

The `.env` file is already configured with:

```env
DATABASE_URL="file:./dev.db"
PORT=3000
```

## Running the Gateway

### Development Mode (with hot reload)

```bash
npm run start:dev
```

### Production Mode

```bash
npm run build
npm run start:prod
```

The server will start on **port 3000** with:

- **WebSocket OCPP endpoint**: `ws://localhost:3000/:cpId`
- **REST API**: `http://localhost:3000/api`

## Charging Point Configuration

Configure your charging station with the following settings:

### WebSocket Connection URL

```
ws://localhost:3000/CP_001
```

Replace `CP_001` with your unique charge point identifier.

### OCPP Protocol

- **Protocol**: OCPP 1.6J
- **Transport**: WebSocket
- **Subprotocol**: `ocpp1.6`

### Heartbeat Interval

- Default: 60 seconds (configured by gateway)

## Testing the Gateway

### Using the Test Client

1. **Setup RFID Cards**:

```bash
cd D:\workspace\REVON_CMSV3\TEST_CLIENT
python setup_rfid.py
```

This creates 3 test RFID cards in the database.

2. **Run Test Client**:

```bash
python ocpp_test_client.py
```

The test client will:

- Connect to the gateway as `CP_TEST_001`
- Send BootNotification
- Simulate a complete charging session
- Send meter values every 2 seconds
- Stop the transaction and disconnect

## REST API Endpoints

### Station Management

- `GET /api/stations` - List all stations
- `GET /api/stations/:cpId` - Get station details
- `GET /api/stations/connected/list` - List connected stations

### Charging Sessions

- `GET /api/sessions` - List all sessions
- `GET /api/sessions/station/:cpId` - Get sessions for a station

### RFID Card Management

- `GET /api/rfid` - List all RFID cards
- `GET /api/rfid/:tagId` - Get card details
- `POST /api/rfid` - Create new RFID card
  ```json
  {
    "tagId": "RFID_001",
    "status": "Active",
    "validUntil": "2026-12-31T23:59:59Z"
  }
  ```
- `POST /api/rfid/:tagId/block` - Block a card
- `POST /api/rfid/:tagId/activate` - Activate a card

### Remote Control

- `POST /api/admin/:cpId/start-transaction` - Remote start
  ```json
  {
    "connectorId": 1,
    "idTag": "RFID_001"
  }
  ```
- `POST /api/admin/:cpId/stop-transaction` - Remote stop
  ```json
  {
    "transactionId": 123456
  }
  ```
- `POST /api/admin/:cpId/change-availability` - Change availability
  ```json
  {
    "connectorId": 1,
    "type": "Operative"
  }
  ```
- `POST /api/admin/:cpId/reset` - Reset station
  ```json
  {
    "type": "Soft"
  }
  ```

## OCPP Messages Supported

### From Charge Point

- ✅ BootNotification
- ✅ Heartbeat
- ✅ StatusNotification
- ✅ Authorize
- ✅ StartTransaction
- ✅ StopTransaction
- ✅ MeterValues
- ✅ ReserveNow
- ✅ CancelReservation

### To Charge Point

- ✅ RemoteStartTransaction
- ✅ RemoteStopTransaction
- ✅ ChangeAvailability
- ✅ Reset
- ✅ UnlockConnector
- ✅ GetConfiguration
- ✅ ChangeConfiguration

## Database Schema

The gateway uses SQLite with the following main tables:

- **ChargingStation** - Station information and status
- **Connector** - Connector details per station
- **RfidCard** - RFID card authorization
- **ChargingSession** - Charging transaction records
- **MeterValue** - Energy consumption data
- **Reservation** - Connector reservations

### View Database

```bash
npx prisma studio
```

This opens a web interface at `http://localhost:5555` to browse the database.

## Logs

The gateway uses Winston for logging:

- **Console**: Colored, formatted logs
- **Level**: info, error, warn, debug

All OCPP messages are logged with the format:

```
[CP_ID] Received: [messageType, uniqueId, action, payload]
[CP_ID] Sending: [messageType, uniqueId, payload]
```

## Troubleshooting

### Port Already in Use

If port 3000 is occupied:

```bash
# Windows
netstat -ano | findstr :3000
taskkill /F /PID <process_id>
```

### Database Locked Error

Stop all running instances and restart:

```bash
# Kill node processes
taskkill /F /IM node.exe
npm run start:dev
```

### WebSocket Connection Failed

1. Verify the gateway is running: `http://localhost:3000/api/stations`
2. Check the charge point URL format: `ws://localhost:3000/CP_ID`
3. Ensure `ocpp1.6` subprotocol is specified
4. Review gateway logs for connection attempts

### RFID Authorization Failed

1. Check if the RFID card exists: `GET /api/rfid/:tagId`
2. Verify card status is "Active"
3. Check expiry date is in the future
4. Review authorization logs in gateway console

## Architecture Notes

### WebSocket Implementation

The gateway uses a **standalone native WebSocket server** (not NestJS WebSocket gateway) for better OCPP protocol compatibility:

- Direct HTTP upgrade handling
- Full control over subprotocol negotiation
- Supports `ocpp1.6` subprotocol requirement

### Message Flow

1. Charge point connects via WebSocket with CP ID in URL
2. Gateway registers connection and sets up handlers
3. OCPP messages are parsed and routed to specific handlers
4. Handlers process business logic and update database
5. Responses sent back to charge point
6. On disconnect, connection is cleaned up and station marked offline

### Transaction ID Format

Transaction IDs use **BigInt** (timestamp in milliseconds) to ensure uniqueness across all sessions.

## Production Considerations

### Before Deployment

1. Change DATABASE_URL to production database (PostgreSQL/MySQL recommended)
2. Update Prisma schema datasource provider
3. Set up proper logging (file-based, log rotation)
4. Configure environment variables for production
5. Enable HTTPS for WebSocket connections (wss://)
6. Implement authentication for REST API
7. Set up monitoring and alerting

### Security

- Add API key authentication for REST endpoints
- Implement charge point authentication
- Use TLS/SSL certificates for production
- Validate all incoming OCPP messages
- Rate limiting for API endpoints
- Secure RFID card data storage

## Support

For issues or questions:

1. Check gateway logs for error messages
2. Verify charge point OCPP configuration
3. Test with the provided Python test client
4. Review OCPP 1.6J specification for protocol details
