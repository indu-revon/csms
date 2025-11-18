import { Injectable } from '@nestjs/common';
import { StationsService } from '../../charging/stations/stations.service';
import { SessionsService } from '../../charging/sessions/sessions.service';
import { RfidService } from '../../charging/rfid/rfid.service';
import { StartTransactionRequest, StartTransactionResponse } from '../dtos/start-transaction.dto';

@Injectable()
export class StartTransactionHandler {
  constructor(
    private readonly stationsService: StationsService,
    private readonly sessionsService: SessionsService,
    private readonly rfidService: RfidService,
  ) {}

  async handle(cpId: string, payload: StartTransactionRequest): Promise<StartTransactionResponse> {
    // Validate RFID tag
    const isValid = await this.rfidService.validateTag(payload.idTag);
    
    if (!isValid) {
      return {
        transactionId: -1,
        idTagInfo: {
          status: 'Invalid',
        },
      };
    }

    // Find the station
    const station = await this.stationsService.findByOcppIdentifier(cpId);
    
    if (!station) {
      throw new Error(`Station not found: ${cpId}`);
    }

    // Generate transaction ID (use timestamp + random for uniqueness)
    const transactionId = Date.now() + Math.floor(Math.random() * 1000);

    // Create charging session
    await this.sessionsService.createSession({
      chargingStationId: station.id,
      connectorId: payload.connectorId,
      ocppTransactionId: transactionId,
      ocppIdTag: payload.idTag,
      startTimestamp: new Date(payload.timestamp),
      startMeterValue: payload.meterStart,
    });

    const card = await this.rfidService.findByTagId(payload.idTag);

    return {
      transactionId,
      idTagInfo: {
        status: 'Accepted',
        expiryDate: card?.validUntil?.toISOString(),
      },
    };
  }
}
