import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import { OcppService } from './ocpp.service';
import { createLogger } from '../config/logger.config';

@WebSocketGateway()
export class OcppGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = createLogger('OcppGateway');

  constructor(private readonly ocppService: OcppService) {}

  async handleConnection(client: WebSocket, req: IncomingMessage) {
    const cpId = this.extractCpId(req.url);
    this.logger.info(`WebSocket connection attempt - URL: ${req.url}, CP ID: ${cpId}, Remote: ${req.socket.remoteAddress}`);

    if (!cpId) {
      this.logger.warn('Connection rejected: No CP ID in URL');
      client.close(1008, 'Invalid CP ID');
      return;
    }

    await this.ocppService.registerConnection(cpId, client);
    this.logger.info(`Successfully registered CP: ${cpId}`);
  }

  async handleDisconnect(client: WebSocket) {
    await this.ocppService.handleDisconnect(client);
  }

  private extractCpId(url: string): string | null {
    if (!url) return null;

    // URL format: /CP_123 or /ocpp/CP_123
    const parts = url.split('/').filter(part => part.length > 0);
    
    // Get the last non-empty part as CP ID
    if (parts.length > 0) {
      return parts[parts.length - 1];
    }

    return null;
  }
}
