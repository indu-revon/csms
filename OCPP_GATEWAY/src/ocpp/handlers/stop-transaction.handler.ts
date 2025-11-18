import { Injectable } from '@nestjs/common';
import { StationsService } from '../../charging/stations/stations.service';
import { SessionsService } from '../../charging/sessions/sessions.service';
import { StopTransactionRequest, StopTransactionResponse } from '../dtos/stop-transaction.dto';

@Injectable()
export class StopTransactionHandler {
  constructor(
    private readonly stationsService: StationsService,
    private readonly sessionsService: SessionsService,
  ) {}

  async handle(cpId: string, payload: StopTransactionRequest): Promise<StopTransactionResponse> {
    // Find the station
    const station = await this.stationsService.findByOcppIdentifier(cpId);
    
    if (!station) {
      throw new Error(`Station not found: ${cpId}`);
    }

    // Find the active session
    const session = await this.sessionsService.findActiveSession(
      station.id,
      payload.transactionId,
    );

    if (!session) {
      throw new Error(`Session not found: ${payload.transactionId}`);
    }

    // Calculate energy consumed
    let energyKwh: number | undefined;
    if (payload.meterStop && session.startMeterValue) {
      energyKwh = (payload.meterStop - session.startMeterValue) / 1000; // Wh to kWh
    }

    // Stop the session
    await this.sessionsService.stopSession(
      station.id,
      payload.transactionId,
      {
        stopTimestamp: new Date(payload.timestamp),
        stopMeterValue: payload.meterStop,
        energyKwh,
      },
    );

    return {
      idTagInfo: {
        status: 'Accepted',
      },
    };
  }
}
