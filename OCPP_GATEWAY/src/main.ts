import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { createLogger } from './config/logger.config';
import { WebSocketServer } from 'ws';
import { OcppService } from './ocpp/ocpp.service';
import { IncomingMessage } from 'http';
import * as WebSocket from 'ws';

async function bootstrap() {
  const logger = createLogger('Bootstrap');

  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });

  // Enable CORS for REST API
  app.enableCors();

  // Enable global validation
  app.useGlobalPipes(new ValidationPipe());

  const port = process.env.PORT || 3000;

  // Debugging: Log the port value
  logger.info(`Attempting to listen on port: ${port}`);
  logger.info(`Port type: ${typeof port}`);
  logger.info(`Process env PORT: ${process.env.PORT}`);

  await app.listen(port, '0.0.0.0');

  // Debugging: Log after successful listen
  logger.info(`Successfully listening on port: ${port}`);

  // Debugging: Log the address the server is listening on
  const server = app.getHttpServer();
  const address = server.address();
  logger.info(`Server address: ${JSON.stringify(address)}`);

  // Get the HTTP server and OcppService instance
  const httpServer = app.getHttpServer();
  const ocppService = app.get(OcppService);

  // Create standalone WebSocket server
  const wss = new WebSocketServer({
    noServer: true,
    handleProtocols: (protocols: Set<string>) => {
      // Accept ocpp1.6 subprotocol
      if (protocols.has('ocpp1.6')) {
        return 'ocpp1.6';
      }
      // Accept any protocol or no protocol
      return Array.from(protocols)[0] || '';
    }
  });

  // Handle HTTP upgrade requests
  httpServer.on('upgrade', (request: IncomingMessage, socket: any, head: Buffer) => {
    logger.info(`WebSocket upgrade request: ${request.url}`);

    // Extract CP ID from URL
    const url = request.url || '';
    const parts = url.split('/').filter(part => part.length > 0);
    const cpId = parts.length > 0 ? parts[parts.length - 1] : null;

    if (!cpId) {
      logger.warn('WebSocket upgrade rejected: No CP ID in URL');
      socket.write('HTTP/1.1 400 Bad Request\r\n\r\n');
      socket.destroy();
      return;
    }

    wss.handleUpgrade(request, socket, head, (ws: WebSocket) => {
      logger.info(`WebSocket connection established for CP: ${cpId}`);
      wss.emit('connection', ws, request);
    });
  });

  // Handle WebSocket connections
  wss.on('connection', async (client: WebSocket, request: IncomingMessage) => {
    const url = request.url || '';
    const parts = url.split('/').filter(part => part.length > 0);
    const cpId = parts.length > 0 ? parts[parts.length - 1] : null;

    if (!cpId) {
      client.close(1008, 'Invalid CP ID');
      return;
    }

    // Register connection with OcppService (it will set up message and error handlers)
    await ocppService.registerConnection(cpId, client);

    // Handle disconnection
    client.on('close', () => {
      ocppService.handleDisconnect(client);
    });
  });

  logger.info(`🚀 OCPP Gateway started`);
  logger.info(`📡 REST API listening on port ${port}`);
  logger.info(`🔌 WebSocket OCPP endpoint: ws://localhost:${port}/:cpId`);
}

bootstrap();
