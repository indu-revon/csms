import { Injectable } from '@nestjs/common';
import { WebSocket } from 'ws';
import { createLogger } from '../config/logger.config';
import { OcppMessage } from '../common/types';
import { OcppMessageType } from '../common/enums';
import { StationsService } from '../charging/stations/stations.service';
import { BootNotificationHandler } from './handlers/boot-notification.handler';
import { HeartbeatHandler } from './handlers/heartbeat.handler';
import { StatusNotificationHandler } from './handlers/status-notification.handler';
import { AuthorizeHandler } from './handlers/authorize.handler';
import { StartTransactionHandler } from './handlers/start-transaction.handler';
import { StopTransactionHandler } from './handlers/stop-transaction.handler';
import { MeterValuesHandler } from './handlers/meter-values.handler';
import { ReserveNowHandler } from './handlers/reserve-now.handler';
import { CancelReservationHandler } from './handlers/cancel-reservation.handler';

interface ConnectionInfo {
  cpId: string;
  socket: WebSocket;
  connectedAt: Date;
}

@Injectable()
export class OcppService {
  private readonly logger = createLogger('OcppService');
  private cpConnections = new Map<string, ConnectionInfo>();
  private socketToCpId = new Map<WebSocket, string>();

  constructor(
    private readonly stationsService: StationsService,
    private readonly bootNotificationHandler: BootNotificationHandler,
    private readonly heartbeatHandler: HeartbeatHandler,
    private readonly statusNotificationHandler: StatusNotificationHandler,
    private readonly authorizeHandler: AuthorizeHandler,
    private readonly startTransactionHandler: StartTransactionHandler,
    private readonly stopTransactionHandler: StopTransactionHandler,
    private readonly meterValuesHandler: MeterValuesHandler,
    private readonly reserveNowHandler: ReserveNowHandler,
    private readonly cancelReservationHandler: CancelReservationHandler,
  ) {}

  async registerConnection(cpId: string, client: WebSocket) {
    this.logger.info(`Charge point connected: ${cpId}`);
    
    this.cpConnections.set(cpId, {
      cpId,
      socket: client,
      connectedAt: new Date(),
    });
    this.socketToCpId.set(client, cpId);

    // Set up message handler
    client.on('message', (raw: Buffer) => {
      this.handleIncomingMessage(client, raw.toString());
    });

    client.on('error', (error) => {
      this.logger.error(`WebSocket error for ${cpId}: ${error.message}`);
    });
  }

  async handleDisconnect(client: WebSocket) {
    const cpId = this.socketToCpId.get(client);
    
    if (cpId) {
      this.logger.info(`Charge point disconnected: ${cpId}`);
      this.cpConnections.delete(cpId);
      this.socketToCpId.delete(client);

      // Mark station as offline
      try {
        await this.stationsService.markOffline(cpId);
      } catch (error) {
        this.logger.error(`Error marking station offline: ${error.message}`);
      }
    }
  }

  async handleIncomingMessage(client: WebSocket, raw: string) {
    const cpId = this.socketToCpId.get(client);
    
    if (!cpId) {
      this.logger.warn('Received message from unregistered client');
      return;
    }

    let msg: OcppMessage;
    try {
      msg = JSON.parse(raw);
      this.logger.info(`[${cpId}] Received: ${JSON.stringify(msg)}`);
    } catch (error) {
      this.logger.error(`Invalid JSON from ${cpId}: ${raw}`);
      return;
    }

    const [messageTypeId, uniqueId, actionOrPayload, payloadIfCall] = msg;

    switch (messageTypeId) {
      case OcppMessageType.CALL:
        await this.handleCall(client, cpId, uniqueId, actionOrPayload as string, payloadIfCall);
        break;
      case OcppMessageType.CALL_RESULT:
        this.logger.info(`[${cpId}] Received CALLRESULT for ${uniqueId}`);
        break;
      case OcppMessageType.CALL_ERROR:
        this.logger.error(`[${cpId}] Received CALLERROR for ${uniqueId}: ${actionOrPayload}`);
        break;
      default:
        this.logger.warn(`Unknown message type: ${messageTypeId}`);
    }
  }

  private async handleCall(
    client: WebSocket,
    cpId: string,
    uniqueId: string,
    action: string,
    payload: any,
  ) {
    let responsePayload: any;

    try {
      switch (action) {
        case 'BootNotification':
          responsePayload = await this.bootNotificationHandler.handle(cpId, payload);
          break;
        case 'Heartbeat':
          responsePayload = await this.heartbeatHandler.handle(cpId, payload);
          break;
        case 'StatusNotification':
          responsePayload = await this.statusNotificationHandler.handle(cpId, payload);
          break;
        case 'Authorize':
          responsePayload = await this.authorizeHandler.handle(cpId, payload);
          break;
        case 'StartTransaction':
          responsePayload = await this.startTransactionHandler.handle(cpId, payload);
          break;
        case 'StopTransaction':
          responsePayload = await this.stopTransactionHandler.handle(cpId, payload);
          break;
        case 'MeterValues':
          responsePayload = await this.meterValuesHandler.handle(cpId, payload);
          break;
        case 'ReserveNow':
          responsePayload = await this.reserveNowHandler.handle(cpId, payload);
          break;
        case 'CancelReservation':
          responsePayload = await this.cancelReservationHandler.handle(cpId, payload);
          break;
        default:
          this.logger.warn(`Unknown action: ${action}`);
          this.sendCallError(client, uniqueId, 'NotImplemented', `Action ${action} not implemented`);
          return;
      }

      this.sendCallResult(client, cpId, uniqueId, responsePayload);
    } catch (error) {
      this.logger.error(`Error handling ${action}: ${error.message}`, { error });
      this.sendCallError(client, uniqueId, 'InternalError', error.message);
    }
  }

  private sendCallResult(client: WebSocket, cpId: string, uniqueId: string, payload: any) {
    const response: OcppMessage = [OcppMessageType.CALL_RESULT, uniqueId, payload];
    const message = JSON.stringify(response);
    this.logger.info(`[${cpId}] Sending: ${message}`);
    client.send(message);
  }

  private sendCallError(client: WebSocket, uniqueId: string, errorCode: string, errorDescription: string) {
    const response = [
      OcppMessageType.CALL_ERROR,
      uniqueId,
      errorCode,
      errorDescription,
      {},
    ];
    client.send(JSON.stringify(response));
  }

  // Method to send commands from central system to charge point
  async sendCommand(cpId: string, action: string, payload: any): Promise<any> {
    const connection = this.cpConnections.get(cpId);
    
    if (!connection) {
      throw new Error(`Charge point ${cpId} not connected`);
    }

    const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const message: OcppMessage = [OcppMessageType.CALL, uniqueId, action, payload];

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Command timeout'));
      }, 30000); // 30 second timeout

      // Store promise handlers for when response comes back
      // In production, you'd want a more sophisticated response handler
      connection.socket.once('message', (raw: Buffer) => {
        clearTimeout(timeout);
        try {
          const response: OcppMessage = JSON.parse(raw.toString());
          if (response[0] === OcppMessageType.CALL_RESULT && response[1] === uniqueId) {
            resolve(response[2]);
          } else if (response[0] === OcppMessageType.CALL_ERROR && response[1] === uniqueId) {
            reject(new Error(response[3] as string));
          }
        } catch (error) {
          reject(error);
        }
      });

      connection.socket.send(JSON.stringify(message));
      this.logger.info(`[${cpId}] Sent command: ${action}`);
    });
  }

  getConnectedStations(): string[] {
    return Array.from(this.cpConnections.keys());
  }

  isStationConnected(cpId: string): boolean {
    return this.cpConnections.has(cpId);
  }
}
