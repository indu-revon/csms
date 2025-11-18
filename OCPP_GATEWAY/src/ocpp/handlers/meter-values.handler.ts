import { Injectable } from '@nestjs/common';
import { StationsService } from '../../charging/stations/stations.service';
import { SessionsService } from '../../charging/sessions/sessions.service';
import { MeterValuesRequest, MeterValuesResponse } from '../dtos/meter-values.dto';

@Injectable()
export class MeterValuesHandler {
  constructor(
    private readonly stationsService: StationsService,
    private readonly sessionsService: SessionsService,
  ) {}

  async handle(cpId: string, payload: MeterValuesRequest): Promise<MeterValuesResponse> {
    // Find the station
    const station = await this.stationsService.findByOcppIdentifier(cpId);
    
    if (!station) {
      throw new Error(`Station not found: ${cpId}`);
    }

    // If transaction ID is provided, store meter values
    if (payload.transactionId) {
      const session = await this.sessionsService.findActiveSession(
        station.id,
        payload.transactionId,
      );

      if (session) {
        // Store each meter value
        for (const meterValue of payload.meterValue) {
          // Find Energy.Active.Import.Register value
          const energyValue = meterValue.sampledValue.find(
            sv => sv.measurand === 'Energy.Active.Import.Register' || !sv.measurand,
          );

          if (energyValue) {
            await this.sessionsService.addMeterValue(
              session.id,
              new Date(meterValue.timestamp),
              parseInt(energyValue.value, 10),
              meterValue,
            );
          }
        }
      }
    }

    return {};
  }
}
