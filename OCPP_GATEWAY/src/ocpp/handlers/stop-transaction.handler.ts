import { Injectable, Logger } from '@nestjs/common';
import { StationsService } from '../../charging/stations/stations.service';
import { SessionsService } from '../../charging/sessions/sessions.service';
import { StopTransactionRequest, StopTransactionResponse } from '../dtos/stop-transaction.dto';

@Injectable()
export class StopTransactionHandler {
  private readonly logger = new Logger(StopTransactionHandler.name);

  constructor(
    private readonly stationsService: StationsService,
    private readonly sessionsService: SessionsService,
  ) { }

  async handle(cpId: string, payload: StopTransactionRequest): Promise<StopTransactionResponse> {
    try {
      // Find the station
      const station = await this.stationsService.findByOcppIdentifier(cpId);

      if (!station) {
        this.logger.error(`[${cpId}] StopTransaction failed: Station not found`);
        return {
          idTagInfo: {
            status: 'Invalid',
          },
        };
      }

      // Find the active session
      const session = await this.sessionsService.findActiveSession(
        station.id,
        payload.transactionId,
      );

      if (!session) {
        this.logger.warn(`[${cpId}] StopTransaction: Session ${payload.transactionId} not found - may already be stopped`);
        // Return accepted anyway - transaction might have been stopped elsewhere
        return {
          idTagInfo: {
            status: 'Accepted',
          },
        };
      }

      // Process transactionData if provided (optional OCPP field)
      if (payload.transactionData && payload.transactionData.length > 0) {
        this.logger.debug(`[${cpId}] Processing ${payload.transactionData.length} meter values from transactionData`);

        // Store each meter value from transactionData
        for (const meterValue of payload.transactionData) {
          if (meterValue.timestamp && meterValue.sampledValue) {
            // Find Energy.Active.Import.Register or default value
            const energyValue = meterValue.sampledValue.find(
              (sv: any) => sv.measurand === 'Energy.Active.Import.Register' || !sv.measurand,
            );

            if (energyValue && energyValue.value) {
              await this.sessionsService.addMeterValue(
                session.id,
                new Date(meterValue.timestamp),
                parseInt(energyValue.value, 10),
                meterValue,
              );
            }
          }
        }

        this.logger.log(`[${cpId}] Stored ${payload.transactionData.length} transaction meter values`);
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
          stopReason: payload.reason,
          energyKwh,
        },
      );

      this.logger.log(`[${cpId}] Transaction ${payload.transactionId} stopped successfully. Energy: ${energyKwh?.toFixed(2)} kWh, Reason: ${payload.reason || 'N/A'}`);

      return {
        idTagInfo: {
          status: 'Accepted',
        },
      };
    } catch (error) {
      this.logger.error(`[${cpId}] StopTransaction error: ${error.message}`, error.stack);
      return {
        idTagInfo: {
          status: 'Accepted', // Accept anyway to allow charge point to complete
        },
      };
    }
  }
}
