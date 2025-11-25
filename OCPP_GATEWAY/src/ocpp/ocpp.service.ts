import { Injectable } from '@nestjs/common';
import { WebSocket } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { createLogger } from '../config/logger.config';
import { OcppMessage } from '../common/types';
import { OcppMessageType } from '../common/enums';
import { StationsService } from '../charging/stations/stations.service';
import { OcppLogsService } from '../api/ocpp-logs.service';
import { BootNotificationHandler } from './handlers/boot-notification.handler';
import { HeartbeatHandler } from './handlers/heartbeat.handler';
import { StatusNotificationHandler } from './handlers/status-notification.handler';
import { AuthorizeHandler } from './handlers/authorize.handler';
import { StartTransactionHandler } from './handlers/start-transaction.handler';
import { StopTransactionHandler } from './handlers/stop-transaction.handler';
import { MeterValuesHandler } from './handlers/meter-values.handler';
import { DataTransferHandler } from './handlers/data-transfer.handler';

interface ConnectionInfo {
  cpId: string;
  socket: WebSocket;
  connectedAt: Date;
}

interface PendingCommand {
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
  timeout: NodeJS.Timeout;
  action: string;
  timestamp: Date;
}

@Injectable()
export class OcppService {
  private readonly logger = createLogger('OcppService');
  private cpConnections = new Map<string, ConnectionInfo>();
  private socketToCpId = new Map<WebSocket, string>();

  // Map to store pending commands: uniqueId -> PendingCommand
  private pendingCommands = new Map<string, PendingCommand>();

  constructor(
    private readonly stationsService: StationsService,
    private readonly ocppLogsService: OcppLogsService,
    private readonly bootNotificationHandler: BootNotificationHandler,
    private readonly heartbeatHandler: HeartbeatHandler,
    private readonly statusNotificationHandler: StatusNotificationHandler,
    private readonly authorizeHandler: AuthorizeHandler,
    private readonly startTransactionHandler: StartTransactionHandler,
    private readonly stopTransactionHandler: StopTransactionHandler,
    private readonly meterValuesHandler: MeterValuesHandler,
    private readonly dataTransferHandler: DataTransferHandler,
  ) { }

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

    client.on('close', () => {
      this.handleDisconnect(client);
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

      // Reject any pending commands for this station? 
      // Ideally yes, but for now let them timeout to avoid complexity with map iteration
    }
  }

  /**
   * Log OCPP message to database (async, non-blocking)
   */
  private async logMessage(
    cpId: string,
    direction: 'INCOMING' | 'OUTGOING',
    messageType: OcppMessageType,
    messageId: string,
    action?: string,
    payload?: any,
  ) {
    try {
      const station = await this.stationsService.findByOcppIdentifier(cpId);
      if (!station) {
        this.logger.warn(`Cannot log message: Station ${cpId} not found in database`);
        return;
      }

      const logType =
        messageType === OcppMessageType.CALL ? 'CALL' :
          messageType === OcppMessageType.CALL_RESULT ? 'CALL_RESULT' : 'CALL_ERROR';

      await this.ocppLogsService.logMessage({
        chargingStationId: station.id,
        direction,
        logType,
        actionType: action,
        messageId,
        request: messageType === OcppMessageType.CALL && payload ? JSON.stringify(payload) : undefined,
        response: messageType !== OcppMessageType.CALL && payload ? JSON.stringify(payload) : undefined,
      });
    } catch (error) {
      // Don't let logging failures affect message processing
      this.logger.error(`Failed to log message to database: ${error.message}`);
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
        // Log incoming CALL message
        this.logMessage(cpId, 'INCOMING', messageTypeId, uniqueId, actionOrPayload as string, payloadIfCall);
        await this.handleCall(client, cpId, uniqueId, actionOrPayload as string, payloadIfCall);
        break;

      case OcppMessageType.CALL_RESULT:
        this.logger.info(`[${cpId}] Received CALLRESULT for ${uniqueId}`);
        // Log incoming CALL_RESULT
        this.logMessage(cpId, 'INCOMING', messageTypeId, uniqueId, undefined, actionOrPayload);

        // Handle response to our command
        this.handleCallResult(uniqueId, actionOrPayload);
        break;

      case OcppMessageType.CALL_ERROR:
        this.logger.error(`[${cpId}] Received CALLERROR for ${uniqueId}: ${actionOrPayload}`);
        // Log incoming CALL_ERROR
        this.logMessage(cpId, 'INCOMING', messageTypeId, uniqueId, undefined, { errorCode: actionOrPayload, errorDescription: payloadIfCall });

        // Handle error response to our command
        this.handleCallError(uniqueId, actionOrPayload as string, payloadIfCall as string);
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
        case 'DataTransfer':
          responsePayload = await this.dataTransferHandler.handle(cpId, payload);
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
    // Log outgoing CALL_RESULT
    this.logMessage(cpId, 'OUTGOING', OcppMessageType.CALL_RESULT, uniqueId, undefined, payload);
    client.send(message);
  }

  private sendCallError(client: WebSocket, uniqueId: string, errorCode: string, errorDescription: string) {
    const cpId = this.socketToCpId.get(client);
    const response = [
      OcppMessageType.CALL_ERROR,
      uniqueId,
      errorCode,
      errorDescription,
      {},
    ];
    // Log outgoing CALL_ERROR
    if (cpId) {
      this.logMessage(cpId, 'OUTGOING', OcppMessageType.CALL_ERROR, uniqueId, undefined, { errorCode, errorDescription });
    }
    client.send(JSON.stringify(response));
  }

  /**
   * Handle a CALL_RESULT (success response) from a Charge Point
   */
  private handleCallResult(uniqueId: string, payload: any) {
    const pending = this.pendingCommands.get(uniqueId);

    if (pending) {
      clearTimeout(pending.timeout);
      this.pendingCommands.delete(uniqueId);
      pending.resolve(payload);
    } else {
      this.logger.warn(`Received CALL_RESULT for unknown or timed-out command: ${uniqueId}`);
    }
  }

  /**
   * Handle a CALL_ERROR (failure response) from a Charge Point
   */
  private handleCallError(uniqueId: string, errorCode: string, errorDescription: string) {
    const pending = this.pendingCommands.get(uniqueId);

    if (pending) {
      clearTimeout(pending.timeout);
      this.pendingCommands.delete(uniqueId);
      pending.reject(new Error(`OCPP Error: ${errorCode} - ${errorDescription}`));
    } else {
      this.logger.warn(`Received CALL_ERROR for unknown or timed-out command: ${uniqueId}`);
    }
  }

  // Method to send commands from central system to charge point
  async sendCommand(cpId: string, action: string, payload: any): Promise<any> {
    const connection = this.cpConnections.get(cpId);

    if (!connection) {
      throw new Error(`Charge point ${cpId} not connected`);
    }

    // Use UUID for robust unique IDs
    const uniqueId = uuidv4();
    const message: OcppMessage = [OcppMessageType.CALL, uniqueId, action, payload];

    return new Promise((resolve, reject) => {
      // Set timeout
      const timeout = setTimeout(() => {
        if (this.pendingCommands.has(uniqueId)) {
          this.pendingCommands.delete(uniqueId);
          reject(new Error('Command timeout'));
        }
      }, 30000); // 30 second timeout

      // Store in pending map
      this.pendingCommands.set(uniqueId, {
        resolve,
        reject,
        timeout,
        action,
        timestamp: new Date()
      });

      // Log outgoing CALL before sending
      this.logMessage(cpId, 'OUTGOING', OcppMessageType.CALL, uniqueId, action, payload);

      try {
        connection.socket.send(JSON.stringify(message));
        this.logger.info(`[${cpId}] Sent command: ${action} (ID: ${uniqueId})`);
      } catch (error) {
        // If sending fails, clean up the pending command immediately
        clearTimeout(timeout);
        this.pendingCommands.delete(uniqueId);
        reject(error);
      }
    });
  }

  getConnectedStations(): string[] {
    return Array.from(this.cpConnections.keys());
  }

  isStationConnected(cpId: string): boolean {
    return this.cpConnections.has(cpId);
  }
}
