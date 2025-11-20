"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const logger_config_1 = require("./config/logger.config");
const ws_1 = require("ws");
const ocpp_service_1 = require("./ocpp/ocpp.service");
async function bootstrap() {
    const logger = (0, logger_config_1.createLogger)('Bootstrap');
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        logger: ['log', 'error', 'warn', 'debug', 'verbose'],
    });
    app.enableCors();
    const port = process.env.PORT || 3000;
    logger.info(`Attempting to listen on port: ${port}`);
    logger.info(`Port type: ${typeof port}`);
    logger.info(`Process env PORT: ${process.env.PORT}`);
    await app.listen(port, '0.0.0.0');
    logger.info(`Successfully listening on port: ${port}`);
    const server = app.getHttpServer();
    const address = server.address();
    logger.info(`Server address: ${JSON.stringify(address)}`);
    const httpServer = app.getHttpServer();
    const ocppService = app.get(ocpp_service_1.OcppService);
    const wss = new ws_1.WebSocketServer({
        noServer: true,
        handleProtocols: (protocols) => {
            if (protocols.has('ocpp1.6')) {
                return 'ocpp1.6';
            }
            return Array.from(protocols)[0] || '';
        }
    });
    httpServer.on('upgrade', (request, socket, head) => {
        logger.info(`WebSocket upgrade request: ${request.url}`);
        const url = request.url || '';
        const parts = url.split('/').filter(part => part.length > 0);
        const cpId = parts.length > 0 ? parts[parts.length - 1] : null;
        if (!cpId) {
            logger.warn('WebSocket upgrade rejected: No CP ID in URL');
            socket.write('HTTP/1.1 400 Bad Request\r\n\r\n');
            socket.destroy();
            return;
        }
        wss.handleUpgrade(request, socket, head, (ws) => {
            logger.info(`WebSocket connection established for CP: ${cpId}`);
            wss.emit('connection', ws, request);
        });
    });
    wss.on('connection', async (client, request) => {
        const url = request.url || '';
        const parts = url.split('/').filter(part => part.length > 0);
        const cpId = parts.length > 0 ? parts[parts.length - 1] : null;
        if (!cpId) {
            client.close(1008, 'Invalid CP ID');
            return;
        }
        await ocppService.registerConnection(cpId, client);
        client.on('close', () => {
            ocppService.handleDisconnect(client);
        });
    });
    logger.info(`🚀 OCPP Gateway started`);
    logger.info(`📡 REST API listening on port ${port}`);
    logger.info(`🔌 WebSocket OCPP endpoint: ws://localhost:${port}/:cpId`);
}
bootstrap();
//# sourceMappingURL=main.js.map