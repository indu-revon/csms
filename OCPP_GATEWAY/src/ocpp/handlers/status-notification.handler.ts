import { Injectable, Logger } from '@nestjs/common';
import { StationsService } from '../../charging/stations/stations.service';
import { ConnectorsService } from '../../charging/connectors/connectors.service';
import { SessionsService } from '../../charging/sessions/sessions.service';
import { StatusNotificationRequest, StatusNotificationResponse } from '../dtos/status-notification.dto';

@Injectable()
export class StatusNotificationHandler {
  private readonly logger = new Logger(StatusNotificationHandler.name);

  constructor(
    private readonly stationsService: StationsService,
    private readonly connectorsService: ConnectorsService,
    private readonly sessionsService: SessionsService,
  ) { }

  async handle(cpId: string, payload: StatusNotificationRequest): Promise<StatusNotificationResponse> {
    try {
      // Find the station
      const station = await this.stationsService.findByOcppIdentifier(cpId);

      if (!station) {
        this.logger.error(`[${cpId}] StatusNotification failed: Station not found`);
        return {};
      }

      // connectorId=0 means the entire charge point (not a specific connector)
      if (payload.connectorId === 0) {
        // Update charge point-level status
        await this.stationsService.updateStation(cpId, {
          status: this.mapConnectorStatusToStationStatus(payload.status),
        });

        this.logger.log(
          `[${cpId}] Charge point status updated to ${payload.status}` +
          (payload.errorCode && payload.errorCode !== 'NoError'
            ? ` (Error: ${payload.errorCode})`
            : '')
        );

        return {};
      }

      // Update specific connector status
      await this.connectorsService.upsertConnector(
        station.id,
        payload.connectorId,
      );

      await this.connectorsService.updateStatus(
        station.id,
        payload.connectorId,
        payload.status,
      );

      // Check for Zombie Sessions
      // If status implies no active transaction (Available, Faulted, Unavailable), ensure no session is active
      const nonActiveStatuses = ['Available', 'Faulted', 'Unavailable', 'Preparing'];
      if (nonActiveStatuses.includes(payload.status)) {
        await this.checkAndCloseZombieSession(station.id, payload.connectorId, cpId, payload.status);
      }

      // If connector is Faulted, store error information
      if (payload.status === 'Faulted' && payload.errorCode && payload.errorCode !== 'NoError') {
        await this.connectorsService.updateErrorInfo(
          station.id,
          payload.connectorId,
          {
            errorCode: payload.errorCode,
            errorInfo: payload.info,
            vendorErrorCode: payload.vendorErrorCode,
          }
        );

        this.logger.warn(
          `[${cpId}] Connector ${payload.connectorId} FAULTED: ` +
          `errorCode=${payload.errorCode}, ` +
          `info=${payload.info || 'N/A'}, ` +
          `vendorErrorCode=${payload.vendorErrorCode || 'N/A'}`
        );
      } else if (payload.status === 'Faulted') {
        // Faulted but no error code provided
        this.logger.warn(`[${cpId}] Connector ${payload.connectorId} faulted with no error code`);
      } else {
        // Normal status update
        this.logger.debug(`[${cpId}] Connector ${payload.connectorId} status: ${payload.status}`);
      }

      return {};
    } catch (error) {
      this.logger.error(`[${cpId}] StatusNotification error: ${error.message}`, error.stack);
      return {}; // Return empty response - StatusNotification doesn't return errors
    }
  }

  /**
   * Check for and close any "Zombie" sessions on a connector that claims to be free
   */
  private async checkAndCloseZombieSession(stationId: number, connectorId: number, cpId: string, status: string) {
    try {
      const activeSessions = await this.sessionsService.findActiveSessionsByStation(stationId);
      const zombieSession = activeSessions.find(s => s.connectorId === connectorId);

      if (zombieSession) {
        this.logger.warn(`[${cpId}] ZOMBIE SESSION DETECTED: Connector ${connectorId} reported ${status} but has active session ${zombieSession.id}. Auto-closing.`);

        await this.sessionsService.stopSession(
          stationId,
          Number(zombieSession.ocppTransactionId),
          {
            stopTimestamp: new Date(),
            stopReason: 'LocalStatusCheck', // Indicates closed due to status mismatch
            stopMeterValue: 0 // Unknown
          }
        );
      }
    } catch (error) {
      this.logger.error(`[${cpId}] Error checking zombie sessions: ${error.message}`);
    }
  }

  /**
   * Map connector status to charge point status
   * Some statuses are connector-specific and shouldn't change charge point status
   */
  private mapConnectorStatusToStationStatus(connectorStatus: string): string {
    switch (connectorStatus) {
      case 'Faulted':
        return 'ERROR';
      case 'Unavailable':
        return 'MAINTENANCE';
      case 'Available':
      case 'Preparing':
      case 'Charging':
      case 'SuspendedEVSE':
      case 'SuspendedEV':
      case 'Finishing':
      case 'Reserved':
        return 'ONLINE';
      default:
        return 'ONLINE';
    }
  }
}
