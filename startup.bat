@echo off
:: Startup script for REVON Charging Management System
:: Runs OCPP_GATEWAY on port 3000 and CPANEL on port 3003

echo Starting REVON Charging Management System...

:: Start OCPP_GATEWAY on port 3000
echo Starting OCPP_GATEWAY on port 3000...
cd OCPP_GATEWAY
start "OCPP_GATEWAY" cmd /k "npm run start:dev"
cd ..

:: Wait a moment for OCPP_GATEWAY to start
timeout /t 3 /nobreak >nul

:: Start CPANEL on port 3003
echo Starting CPANEL on port 3003...
cd CPANEL
set PORT=3003
start "CPANEL" cmd /k "npm run dev"
cd ..

echo Services started:
echo - OCPP_GATEWAY (API ^& WebSocket): http://localhost:3000
echo - CPANEL (Admin Panel): http://localhost:3003
echo.
echo Close the terminal windows to stop the services