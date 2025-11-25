# REVON Charging Station Management System (CSMS) v3

A professional OCPP 1.6J-compliant Charging Station Management System built with NestJS and React.

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **PostgreSQL** (for production) or SQLite (for development)
- **Git**

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd REVON_CMSV3

# Install all dependencies (for both backend and frontend)
npm install
```

### Environment Setup

1. **OCPP_GATEWAY** (Backend):
   ```bash
   cd OCPP_GATEWAY
   cp .env.example .env
   # Edit .env with your database credentials
   ```

2. **CPANEL** (Frontend):
   ```bash
   cd CPANEL
   cp .env.example .env
   # Configure API endpoint if needed
   ```

### Database Setup

```bash
# Run database migrations
npm run migrate
```

### Running the Application

#### Development Mode (Recommended for Development)

```bash
# Start both OCPP Gateway and Admin Panel in development mode
npm run dev
```

This will start:
- **OCPP_GATEWAY** (Backend + WebSocket): http://localhost:3000
- **CPANEL** (Admin Panel): http://localhost:3003

#### Production Mode

```bash
# Build both applications
npm run build

# Run in production mode
npm run prod
```

#### Using PM2 (Recommended for Production Servers)

```bash
# Start with PM2
npm run pm2:start

# View logs
npm run pm2:logs

# Monitor processes
npm run pm2:monit

# Restart services
npm run pm2:restart

# Stop services
npm run pm2:stop
```

## 📁 Project Structure

```
REVON_CMSV3/
├── OCPP_GATEWAY/          # NestJS backend (OCPP 1.6J implementation)
│   ├── src/
│   │   ├── ocpp/          # OCPP protocol handlers
│   │   ├── sessions/      # Charging session management
│   │   ├── stations/      # Station management
│   │   └── main.ts        # Application entry point
│   ├── prisma/            # Database schema and migrations
│   └── package.json
│
├── CPANEL/                # React + Vite frontend (Admin Panel)
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Application pages
│   │   ├── services/      # API service layer
│   │   └── App.tsx        # Application root
│   └── package.json
│
├── DOC/                   # Documentation
├── deploy/                # Deployment artifacts
├── ecosystem.config.js    # PM2 configuration
├── package.json           # Root workspace configuration
└── README.md             # This file
```

## 🛠️ Available Commands

### Workspace Management

| Command | Description |
|---------|-------------|
| `npm install` | Install dependencies for all workspaces |
| `npm run clean` | Clean up processes on ports 3000-3007 |

### Development

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both services in development mode |
| `npm run dev:gateway` | Start only OCPP Gateway in dev mode |
| `npm run dev:cpanel` | Start only Admin Panel in dev mode |

### Production

| Command | Description |
|---------|-------------|
| `npm run build` | Build both applications for production |
| `npm run start` | Start both services (gateway in prod, panel in dev) |
| `npm run prod` | Start both services with production builds |

### Database

| Command | Description |
|---------|-------------|
| `npm run migrate` | Run database migrations (development) |
| `npm run migrate:deploy` | Deploy migrations (production) |
| `npm run studio` | Open Prisma Studio (database GUI) |

### Process Management (PM2)

| Command | Description |
|---------|-------------|
| `npm run pm2:start` | Start services with PM2 |
| `npm run pm2:stop` | Stop PM2 services |
| `npm run pm2:restart` | Restart PM2 services |
| `npm run pm2:logs` | View PM2 logs |
| `npm run pm2:monit` | Monitor PM2 processes |

## 🏗️ Architecture

### OCPP_GATEWAY (Backend)

- **Framework**: NestJS
- **Protocol**: OCPP 1.6J over WebSocket
- **Database**: Prisma ORM (PostgreSQL/SQLite)
- **Port**: 3000

**Key Features**:
- Full OCPP 1.6J Core Profile implementation
- WebSocket server for charging station connections
- REST API for admin panel
- Real-time session management
- Transaction handling and logging

### CPANEL (Frontend)

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **UI Library**: Ant Design
- **State Management**: Zustand
- **Port**: 3003

**Key Features**:
- Charging station monitoring and management
- Live session tracking with auto-refresh
- Remote actions (start/stop transactions, reset, etc.)
- OCPP message logs and terminal
- User and RFID card management
- Analytics and reporting

## 🔌 OCPP Integration

### Connecting a Charging Station

Configure your charging station with:
- **WebSocket URL**: `ws://your-server-ip:3000/ocpp/{charge_point_id}`
- **Protocol**: OCPP 1.6J
- **Charge Point ID**: Unique identifier for your station

### Supported OCPP Messages

**Core Profile** (Fully Implemented):
- ✅ BootNotification
- ✅ Authorize
- ✅ StartTransaction
- ✅ StopTransaction
- ✅ Heartbeat
- ✅ MeterValues
- ✅ StatusNotification
- ✅ DataTransfer

**Remote Commands**:
- ✅ RemoteStartTransaction
- ✅ RemoteStopTransaction
- ✅ Reset
- ✅ UnlockConnector
- ✅ ChangeAvailability
- ✅ ClearCache
- ✅ TriggerMessage

## 📊 Monitoring & Debugging

### Application Logs

```bash
# View PM2 logs
npm run pm2:logs

# View specific service logs
pm2 logs ocpp-gateway
pm2 logs cpanel
```

### Database Access

```bash
# Open Prisma Studio for visual database management
npm run studio
```

### Health Checks

The system provides health endpoints for monitoring:

- **OCPP Gateway Health**: http://localhost:3000/health
- **OCPP Gateway Info**: http://localhost:3000
- **Admin Panel**: http://localhost:3003

The `/health` endpoint returns:
```json
{
  "status": "ok",
  "service": "OCPP Gateway",
  "timestamp": "2025-11-24T12:00:00.000Z"
}
```

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Clean up ports before starting
npm run clean
```

### Database Connection Issues

1. Check `.env` file in `OCPP_GATEWAY` directory
2. Ensure PostgreSQL is running
3. Run migrations: `npm run migrate`

### Services Won't Start

```bash
# Stop all PM2 processes
npm run pm2:stop

# Clean ports
npm run clean

# Try starting again
npm run dev
```

### WebSocket Connection Failed

1. Check firewall rules (port 3000 must be open)
2. Verify charging station configuration
3. Check OCPP Gateway logs for connection attempts

## 📚 Additional Documentation

- [OCPP Development Guidelines](./OCPP_DEVELOPMENT_GUIDELINES.md)
- [Startup Guide](./STARTUP_GUIDE.md)
- [OCPP v1.6 Core Profile Review](./OCPP_V16_CORE_PROFILE_REVIEW.md)
- [API Documentation](./DOC/)

## 🚢 Deployment

### Apache Deployment

See deployment scripts:
- `generate_deploy.sh` - Generate deployment package
- `deploy/` - Deployment artifacts

### PM2 Production Setup

```bash
# Build applications
npm run build

# Start with PM2
npm run pm2:start

# Save PM2 configuration
pm2 save

# Set PM2 to start on boot
pm2 startup
```

## 🔐 Security Notes

- Always use HTTPS/WSS in production
- Keep `.env` files secure and never commit them
- Update dependencies regularly
- Use firewall rules to restrict access
- Enable authentication for production deployments

## 📝 License

UNLICENSED - Proprietary software by RevonTech

## 🤝 Support

For issues and questions, please contact the development team or create an issue in the repository.

---

**Development Status**: Active Development
**OCPP Version**: 1.6J
**Last Updated**: November 2025
