# REVON CMS - Control Panel

Web-based admin panel for REVON Charging Management System.

## Tech Stack

- **React 18** with TypeScript
- **Vite** - Fast build tool
- **Ant Design** - UI Component library
- **React Router** - Routing
- **Zustand** - State management
- **Axios** - HTTP client
- **Recharts** - Charts and data visualization

## Prerequisites

- Node.js 18+
- npm or yarn
- OCPP Gateway running on `localhost:3000`

## Installation

```bash
cd D:\workspace\REVON_CMSV3\CPANEL
npm install
```

## Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Features

### Core Modules

1. **Dashboard**

   - Real-time statistics (stations, sessions, energy)
   - Recent sessions overview
   - System health indicators

2. **Stations Management**

   - View all charging stations
   - Monitor online/offline status
   - Station details with connectors
   - Real-time heartbeat monitoring

3. **Sessions Management**

   - View all charging sessions
   - Filter by date, station, RFID
   - Session details with energy consumption
   - Transaction history

4. **RFID Card Management**

   - List all RFID cards
   - Create new cards
   - Block/activate cards
   - Set validity periods

5. **Reservations**

   - View active reservations
   - Create new reservations
   - Cancel reservations
   - Expiry management

6. **Remote Operations**

   - Remote start transaction
   - Remote stop transaction
   - Change availability
   - Reset station (soft/hard)
   - Unlock connector

7. **User Management**
   - Admin users
   - Role-based access control
   - User permissions

### Authentication

- JWT-based authentication
- Persistent login with token refresh
- Role-based access control (SUPER_ADMIN, OPERATOR, VIEWER)

## Environment Variables

Create `.env` file:

```env
VITE_API_URL=http://localhost:3000/api
```

## API Integration

The admin panel connects to the OCPP Gateway REST API:

- **Base URL**: `http://localhost:3000/api`
- **Authentication**: Bearer token in Authorization header
- **Proxy**: Configured in `vite.config.ts` for development

### API Endpoints Used

- `GET /stations` - List stations
- `GET /sessions` - List sessions
- `GET /rfid` - List RFID cards
- `POST /admin/:cpId/start-transaction` - Remote start
- `POST /admin/:cpId/stop-transaction` - Remote stop
- `POST /admin/:cpId/change-availability` - Change availability
- `POST /admin/:cpId/reset` - Reset station

## Project Structure

```
src/
├── components/
│   └── layout/
│       └── AdminLayout.tsx    # Main layout with sidebar
├── pages/
│   ├── Dashboard.tsx          # Dashboard page
│   ├── Login.tsx              # Login page
│   ├── stations/              # Station management
│   ├── sessions/              # Session management
│   ├── rfid/                  # RFID management
│   ├── reservations/          # Reservation management
│   ├── operations/            # Remote operations
│   └── users/                 # User management
├── services/
│   ├── apiClient.ts           # Axios wrapper
│   └── api.ts                 # API service functions
├── stores/
│   └── authStore.ts           # Authentication state
├── App.tsx                    # Main app component
└── main.tsx                   # App entry point
```

## Default Login

For development/demo:

- **Email**: any@email.com
- **Password**: any password

(Mock authentication - replace with real API integration)

## Development Notes

- Hot module replacement enabled
- API proxy configured for `/api` routes
- TypeScript strict mode enabled
- ESLint configured for code quality

## Future Enhancements

- Real-time updates via WebSocket
- Advanced analytics and charts
- Map view for station locations
- Firmware management UI
- Configuration management
- Audit log viewer
- Export to CSV/PDF
- Dark mode theme
