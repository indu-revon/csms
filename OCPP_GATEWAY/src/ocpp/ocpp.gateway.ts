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
import { StationsService } from '../charging/stations/stations.service';

@WebSocketGateway()
export class OcppGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = createLogger('OcppGateway');

  constructor(
    private readonly ocppService: OcppService,
    private readonly stationsService: StationsService,
  ) {}

  async handleConnection(client: WebSocket, req: IncomingMessage) {
    const cpId = this.extractCpId(req.url);
    this.logger.info(`WebSocket connection attempt - URL: ${req.url}, CP ID: ${cpId}, Remote: ${req.socket.remoteAddress}`);

    if (!cpId) {
      this.logger.warn('Connection rejected: No CP ID in URL');
      client.close(1008, 'Invalid CP ID');
      return;
    }

    // Check if the station is registered in the system
    const existingStation = await this.stationsService.findByOcppIdentifier(cpId);
    if (!existingStation) {
      this.logger.warn(`Connection rejected: Station ${cpId} not registered in the system`);
      client.close(1008, 'Station not registered');
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