# OCPP Gateway

A comprehensive OCPP 1.6J gateway implementation built with NestJS and TypeScript for managing Electric Vehicle (EV) charging stations.

## 🚀 Features

### OCPP Protocol Support

- **WebSocket Communication**: Full OCPP 1.6J JSON over WebSocket support
- **Connection Management**: Automatic charge point registration and disconnection handling
- **Message Routing**: Intelligent routing of OCPP messages to appropriate handlers

### Core OCPP Messages

- ✅ BootNotification - Station registration and configuration
- ✅ Heartbeat - Keep-alive mechanism
- ✅ StatusNotification - Connector status updates
- ✅ Authorize - RFID card authorization
- ✅ StartTransaction - Begin charging sessions
- ✅ StopTransaction - End charging sessions
- ✅ MeterValues - Real-time energy meter readings

### Advanced Features

- ✅ Reservations (ReserveNow, CancelReservation)
- ✅ Remote Control (RemoteStartTransaction, RemoteStopTransaction)
- ✅ Station Management (ChangeAvailability, Reset, UnlockConnector)
- ✅ Configuration Management (GetConfiguration, ChangeConfiguration)

### REST API

- Station management and monitoring
- Charging session tracking
- RFID card management
- Remote control operations
- Real-time connection status

## 📋 Prerequisites

- Node.js v20+ LTS
- MySQL 8.x
- npm or yarn

## 🛠️ Installation

1. **Clone and navigate to the project**

```bash
cd D:\workspace\REVON_CMSV3\OCPP_GATEWAY
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment**

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
PORT=3000
OCPP_WS_PORT=8080
OCPP_WS_PATH=/ocpp

DATABASE_URL="mysql://user:password@localhost:3306/ocpp_gateway"

HEARTBEAT_INTERVAL=60
BOOT_NOTIFICATION_STATUS=Accepted

LOG_LEVEL=info
```

4. **Setup database**

```bash
# Create database
mysql -u root -p -e "CREATE DATABASE ocpp_gateway;"

# Run migrations
npm run prisma:migrate
```

5. **Generate Prisma Client**

```bash
npm run prisma:generate
```

## 🚦 Running the Application

### Development Mode

```bash
npm run start:dev
```

### Production Mode

```bash
npm run build
npm run start:prod
```

The application will start with:

- REST API on `http://localhost:3000`
- OCPP WebSocket on `ws://localhost:3000/ocpp/:cpId`

## 📡 OCPP WebSocket Endpoint

Charge points should connect to:

```
ws://your-server:3000/ocpp/{CHARGE_POINT_ID}
```

Example:

```
ws://localhost:3000/ocpp/CP_001
```

## 🔌 REST API Endpoints

### Stations

- `GET /api/stations` - List all charging stations
- `GET /api/stations/:cpId` - Get station details
- `GET /api/stations/connected/list` - List connected stations

### Sessions

- `GET /api/sessions` - List charging sessions
- `GET /api/sessions/station/:cpId` - Get sessions by station

### RFID Management

- `GET /api/rfid` - List all RFID cards
- `GET /api/rfid/:tagId` - Get RFID card details
- `POST /api/rfid` - Create new RFID card
- `POST /api/rfid/:tagId/block` - Block RFID card
- `POST /api/rfid/:tagId/activate` - Activate RFID card

### Admin/Remote Control

- `POST /api/admin/:cpId/start-transaction` - Remotely start charging
- `POST /api/admin/:cpId/stop-transaction` - Remotely stop charging
- `POST /api/admin/:cpId/change-availability` - Change connector availability
- `POST /api/admin/:cpId/reset` - Reset charge point
- `POST /api/admin/:cpId/unlock-connector` - Unlock connector
- `POST /api/admin/:cpId/get-configuration` - Get station configuration
- `POST /api/admin/:cpId/change-configuration` - Change station configuration

## 📊 Database Schema

The gateway uses MySQL with Prisma ORM. Key entities:

- **ChargingStation** - Charge point information
- **Connector** - Individual connector status
- **RfidCard** - RFID card management
- **ChargingSession** - Transaction records
- **MeterValue** - Energy consumption data
- **Reservation** - Connector reservations

## 🏗️ Architecture

```
src/
├── app.module.ts           # Root application module
├── main.ts                 # Application entry point
├── config/                 # Configuration files
│   ├── database.config.ts  # Prisma service
│   └── logger.config.ts    # Winston logger setup
├── common/                 # Shared utilities
│   ├── enums/             # Enum definitions
│   └── types/             # Type definitions
├── ocpp/                   # OCPP WebSocket layer
│   ├── ocpp.gateway.ts    # WebSocket gateway
│   ├── ocpp.service.ts    # Message routing
│   ├── remote-control.service.ts
│   ├── handlers/          # OCPP message handlers
│   └── dtos/              # OCPP request/response DTOs
├── charging/               # Business logic layer
│   ├── stations/          # Station management
│   ├── connectors/        # Connector management
│   ├── sessions/          # Session tracking
│   ├── rfid/              # RFID authentication
│   └── reservations/      # Reservation management
└── api/                    # REST API layer
    └── controllers/        # HTTP controllers
```

## 🧪 Testing OCPP Connection

You can test the OCPP connection using a WebSocket client:

```javascript
const ws = new WebSocket("ws://localhost:3000/ocpp/TEST_CP_001");

// Send BootNotification
ws.send(
  JSON.stringify([
    2,
    "1234",
    "BootNotification",
    {
      chargePointVendor: "TestVendor",
      chargePointModel: "TestModel",
    },
  ])
);
```

## 📝 Prisma Commands

```bash
# Generate Prisma Client
npm run prisma:generate

# Create migration
npm run prisma:migrate

# Open Prisma Studio
npm run prisma:studio
```

## 🔍 Logging

Logs are stored in the `logs/` directory:

- `combined.log` - All log levels
- `error.log` - Error logs only

## 🛡️ Security Considerations

For production deployment:

1. Enable authentication/authorization on REST API
2. Use TLS/SSL for WebSocket connections (wss://)
3. Implement rate limiting
4. Add input validation middleware
5. Secure database credentials
6. Enable proper firewall rules
7. Implement OCPP security profiles

## 📈 Scaling

The gateway supports horizontal scaling:

- Use Redis for shared session state
- Implement message queue for async processing
- Deploy multiple instances behind load balancer
- Use database connection pooling

## 🐛 Troubleshooting

### WebSocket Connection Issues

- Check firewall settings
- Verify OCPP_WS_PATH in .env
- Check charge point URL format

### Database Connection

- Verify DATABASE_URL in .env
- Ensure MySQL is running
- Check database permissions

## 📄 License

UNLICENSED

## 🤝 Support

For issues and questions, please refer to the project documentation or contact the development team.
