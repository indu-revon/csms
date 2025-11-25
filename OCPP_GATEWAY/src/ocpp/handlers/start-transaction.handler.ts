import { Injectable, Logger } from '@nestjs/common';
import { StationsService } from '../../charging/stations/stations.service';
import { SessionsService } from '../../charging/sessions/sessions.service';
import { RfidService } from '../../charging/rfid/rfid.service';
import { ConnectorsService } from '../../charging/connectors/connectors.service';
import { StartTransactionRequest, StartTransactionResponse } from '../dtos/start-transaction.dto';

@Injectable()
export class StartTransactionHandler {
  private readonly logger = new Logger(StartTransactionHandler.name);

  constructor(
    private readonly stationsService: StationsService,
    private readonly sessionsService: SessionsService,
    private readonly rfidService: RfidService,
    private readonly connectorsService: ConnectorsService,
  ) { }

  async handle(cpId: string, payload: StartTransactionRequest): Promise<StartTransactionResponse> {
    try {
      // Find the station
      const station = await this.stationsService.findByOcppIdentifier(cpId);

      if (!station) {
        this.logger.error(`[${cpId}] Station not found`);
        throw new Error(`Station not found: ${cpId}`);
      }

      // Validate RFID tag with comprehensive checks
      const card = await this.rfidService.findByTagId(payload.idTag);

      if (!card) {
        this.logger.warn(`[${cpId}] Start transaction failed: Invalid RFID tag ${payload.idTag}`);
        return {
          transactionId: 0, // 0 indicates failure per OCPP spec
          idTagInfo: {
            status: 'Invalid',
          },
        };
      }

      // Check card status
      if (card.status !== 'Active') {
        this.logger.warn(`[${cpId}] Start transaction failed: RFID ${payload.idTag} is ${card.status}`);
        return {
          transactionId: 0,
          idTagInfo: {
            status: 'Blocked',
          },
        };
      }

      // Check card expiry
      if (card.validUntil && new Date(card.validUntil) < new Date()) {
        this.logger.warn(`[${cpId}] Start transaction failed: RFID ${payload.idTag} expired`);
        return {
          transactionId: 0,
          idTagInfo: {
            status: 'Expired',
          },
        };
      }

      // Check if card is valid yet
      if (card.validFrom && new Date(card.validFrom) > new Date()) {
        this.logger.warn(`[${cpId}] Start transaction failed: RFID ${payload.idTag} not valid yet`);
        return {
          transactionId: 0,
          idTagInfo: {
            status: 'Invalid',
          },
        };
      }

      // Check connector availability
      const connector = await this.connectorsService.findConnector(station.id, payload.connectorId);

      if (!connector) {
        this.logger.error(`[${cpId}] Connector ${payload.connectorId} not found`);
        return {
          transactionId: 0,
          idTagInfo: {
            status: 'Invalid',
          },
        };
      }

      // Validate connector status
      const unavailableStatuses = ['Faulted', 'Unavailable', 'Reserved'];
      if (connector.status && unavailableStatuses.includes(connector.status)) {
        this.logger.warn(`[${cpId}] Start transaction failed: Connector ${payload.connectorId} is ${connector.status}`);
        return {
          transactionId: 0,
          idTagInfo: {
            status: 'Invalid',
          },
        };
      }

      // Check for existing active session on this connector
      const activeSessions = await this.sessionsService.findActiveSessionsByStation(station.id);
      const existingSession = activeSessions.find(s => s.connectorId === connector.id);

      if (existingSession) {
        this.logger.warn(`[${cpId}] Zombie session detected: Session ${existingSession.id} is still ACTIVE on connector ${payload.connectorId}. Auto-closing it to allow new transaction.`);

        // Auto-close the zombie session
        await this.sessionsService.stopSession(station.id, Number(existingSession.ocppTransactionId), {
          stopTimestamp: new Date(),
          stopReason: 'ZombieSessionAutoClosed',
          stopMeterValue: 0 // We don't have the final meter value, assume 0 or previous
        });

        // TODO: Emit event to frontend for popup notification
      }

      // Create charging session - use database ID as transaction ID
      const session = await this.sessionsService.createSession({
        chargingStationId: station.id,
        connectorId: connector.id,
        ocppTransactionId: 0, // Temporary, will be updated with session.id
        ocppIdTag: payload.idTag,
        startTimestamp: new Date(payload.timestamp),
        startMeterValue: payload.meterStart,
      });

      // Update session with its own ID as the OCPP transaction ID
      // This ensures unique, sequential transaction IDs with no collision risk
      const transactionId = session.id;
      await this.sessionsService.updateTransactionId(session.id, transactionId);

      this.logger.log(`[${cpId}] Transaction ${transactionId} started successfully for RFID ${payload.idTag} on connector ${payload.connectorId}`);

      return {
        transactionId,
        idTagInfo: {
          status: 'Accepted',
          expiryDate: card.validUntil?.toISOString(),
          parentIdTag: card.parentIdTag || undefined,
        },
      };
    } catch (error) {
      this.logger.error(`[${cpId}] Error starting transaction: ${error.message}`, error.stack);
      throw error;
    }
  }
}
