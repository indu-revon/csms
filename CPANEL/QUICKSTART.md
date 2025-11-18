# REVON CMS Control Panel - Quick Start Guide

## Installation & Setup

### 1. Install Dependencies

```bash
cd D:\workspace\REVON_CMSV3\CPANEL
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

Access the application at: **http://localhost:5173**

### 3. Login

Use any credentials for demo mode:

- Email: `admin@revon.com`
- Password: `password`

## Using the Control Panel

### Dashboard

- View real-time statistics
- Monitor online/offline stations
- Track active charging sessions
- See recent transaction history

### Station Management (`/stations`)

- View all registered charging stations
- Check connection status and last heartbeat
- Access station details and connector information

### Session Management (`/sessions`)

- Browse all charging sessions
- Filter by date range, station, or RFID
- View energy consumption and duration
- Export session data

### RFID Card Management (`/rfid`)

- List all authorized RFID cards
- Create new RFID cards
- Block or activate cards
- Set validity periods

### Remote Operations (`/operations`)

Execute remote commands to charging stations:

**Remote Start:**

1. Select "Remote Start" operation
2. Enter Station ID (e.g., `CP_TEST_001`)
3. Enter Connector ID (usually `1`)
4. Enter RFID Tag (e.g., `RFID_TEST_001`)
5. Click "Execute"

**Remote Stop:**

1. Select "Remote Stop" operation
2. Enter Station ID
3. Enter Transaction ID
4. Click "Execute"

**Change Availability:**

1. Select "Change Availability"
2. Enter Station ID and Connector ID
3. Choose type: `Operative` or `Inoperative`
4. Click "Execute"

**Reset Station:**

1. Select "Reset" operation
2. Enter Station ID
3. Choose reset type: `Soft` or `Hard`
4. Click "Execute"

**Unlock Connector:**

1. Select "Unlock Connector"
2. Enter Station ID and Connector ID
3. Click "Execute"

## API Connection

The control panel connects to the OCPP Gateway API at:

```
http://localhost:3000/api
```

Ensure the OCPP Gateway is running before using the control panel:

```bash
cd D:\workspace\REVON_CMSV3\OCPP_GATEWAY
npm run start:dev
```

## Troubleshooting

### Connection Errors

- Verify OCPP Gateway is running on port 3000
- Check `.env` file has correct `VITE_API_URL`
- Clear browser cache and reload

### Login Issues

- Demo mode accepts any credentials
- For production, implement proper JWT authentication

### API Errors

- Check browser console for detailed error messages
- Verify API endpoints in Network tab
- Ensure CORS is properly configured on backend

## Next Steps

1. **Implement Real Authentication**

   - Replace mock login with actual JWT auth
   - Connect to `/auth/login` endpoint
   - Handle token refresh

2. **Complete Page Implementations**

   - Add full CRUD operations for stations
   - Implement session filtering and export
   - Build detailed views for stations and sessions

3. **Add Real-time Updates**

   - Implement WebSocket for live station status
   - Auto-refresh active sessions
   - Push notifications for events

4. **Enhance UI/UX**
   - Add loading states
   - Implement error boundaries
   - Add toast notifications
   - Improve mobile responsiveness

## Production Deployment

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

Deploy the `dist/` folder to your web server.
