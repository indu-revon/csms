# OCPP Gateway - Quick Start Guide

## Prerequisites Check

Before starting, ensure you have:

- ✅ Node.js v20+ installed
- ✅ MySQL 8.x running
- ✅ Database created (`ocpp_gateway`)

## Step-by-Step Setup

### 1. Environment Configuration

Copy the example environment file:

```bash
copy .env.example .env
```

Edit `.env` with your MySQL credentials:

```env
DATABASE_URL="mysql://root:your_password@localhost:3306/ocpp_gateway"
```

### 2. Database Setup

Create the database:

```sql
CREATE DATABASE ocpp_gateway CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Run Prisma migrations:

```bash
npm run prisma:migrate
```

When prompted for migration name, use: `init`

### 3. Generate Prisma Client

```bash
npm run prisma:generate
```

### 4. Start the Application

Development mode (with hot reload):

```bash
npm run start:dev
```

You should see:

```
🚀 OCPP Gateway started
📡 REST API listening on port 3000
🔌 WebSocket OCPP endpoint: ws://localhost:3000/ocpp/:cpId
```

## Testing the Gateway

### Test REST API

Open browser or use curl:

```bash
curl http://localhost:3000/api/stations
```

### Test OCPP WebSocket

Create a test RFID card first:

```bash
curl -X POST http://localhost:3000/api/rfid \
  -H "Content-Type: application/json" \
  -d '{
    "tagId": "TEST_CARD_001",
    "status": "Active",
    "validFrom": "2024-01-01T00:00:00Z",
    "validUntil": "2025-12-31T23:59:59Z"
  }'
```

### Connect a Charge Point

Use a WebSocket client to connect:

```
ws://localhost:3000/ocpp/CP_TEST_001
```

Send BootNotification:

```json
[
  2,
  "msg-001",
  "BootNotification",
  {
    "chargePointVendor": "TestVendor",
    "chargePointModel": "Model-X"
  }
]
```

Expected response:

```json
[
  3,
  "msg-001",
  {
    "status": "Accepted",
    "currentTime": "2024-11-17T...",
    "interval": 60
  }
]
```

## Common Operations

### View Connected Stations

```bash
curl http://localhost:3000/api/stations/connected/list
```

### Remotely Start Charging

```bash
curl -X POST http://localhost:3000/api/admin/CP_TEST_001/start-transaction \
  -H "Content-Type: application/json" \
  -d '{
    "connectorId": 1,
    "idTag": "TEST_CARD_001"
  }'
```

### View Charging Sessions

```bash
curl http://localhost:3000/api/sessions
```

## Database Management

### View Database in Prisma Studio

```bash
npm run prisma:studio
```

This opens a web interface at `http://localhost:5555`

### Reset Database

```bash
npx prisma migrate reset
```

## Production Deployment

### Build for Production

```bash
npm run build
```

### Run Production Server

```bash
npm run start:prod
```

### Using PM2 (Recommended)

```bash
npm install -g pm2
pm2 start dist/main.js --name ocpp-gateway
pm2 save
pm2 startup
```

## Troubleshooting

### Port Already in Use

```bash
# Change PORT in .env file
PORT=3001
```

### Database Connection Error

- Verify MySQL is running
- Check DATABASE_URL credentials
- Ensure database exists

### WebSocket Connection Refused

- Check firewall settings
- Verify OCPP_WS_PATH in .env
- Ensure application is running

### Prisma Client Not Generated

```bash
npm run prisma:generate
```

## Next Steps

1. Configure production database
2. Set up SSL/TLS certificates
3. Implement authentication
4. Configure logging levels
5. Set up monitoring
6. Deploy to production server

## Support

For issues or questions, refer to:

- Main README.md
- Gateway development documentation
- OCPP 1.6J specification
