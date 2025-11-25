import { Injectable, Logger } from '@nestjs/common';
import { StationsService } from '../../charging/stations/stations.service';
import { SessionsService } from '../../charging/sessions/sessions.service';
import { MeterValuesRequest, MeterValuesResponse } from '../dtos/meter-values.dto';

// Supported OCPP 1.6 measurands
const SUPPORTED_MEASURANDS = [
  'Energy.Active.Import.Register',
  'Power.Active.Import',
  'Voltage',
  'Current.Import',
  'SoC', // State of Charge
  'Temperature',
] as const;

@Injectable()
export class MeterValuesHandler {
  private readonly logger = new Logger(MeterValuesHandler.name);

  constructor(
    private readonly stationsService: StationsService,
    private readonly sessionsService: SessionsService,
  ) { }

  async handle(cpId: string, payload: MeterValuesRequest): Promise<MeterValuesResponse> {
    try {
      // Find the station
      const station = await this.stationsService.findByOcppIdentifier(cpId);

      if (!station) {
        this.logger.error(`[${cpId}] MeterValues failed: Station not found`);
        return {};
      }

      // If transaction ID is provided, store meter values
      if (payload.transactionId) {
        const session = await this.sessionsService.findActiveSession(
          station.id,
          payload.transactionId,
        );

        if (!session) {
          this.logger.warn(`[${cpId}] MeterValues: Session ${payload.transactionId} not found`);
          return {};
        }

        let processedCount = 0;
        const measurandCounts: Record<string, number> = {};

        // Store each meter value
        for (const meterValue of payload.meterValue) {
          const timestamp = new Date(meterValue.timestamp);

          // Process each sampled value in this reading
          for (const sampledValue of meterValue.sampledValue) {
            const measurand = sampledValue.measurand || 'Energy.Active.Import.Register'; // Default per OCPP spec

            // Track measurand counts for logging
            measurandCounts[measurand] = (measurandCounts[measurand] || 0) + 1;

            // Parse value - support both integer and decimal values
            let numericValue: number;
            try {
              numericValue = parseFloat(sampledValue.value);
              if (isNaN(numericValue)) {
                this.logger.warn(`[${cpId}] Invalid ${measurand} value: ${sampledValue.value}`);
                continue;
              }
            } catch (error) {
              this.logger.warn(`[${cpId}] Failed to parse ${measurand} value: ${sampledValue.value}`);
              continue;
            }

            // Store the meter value
            // For Energy, store as Wh (primary for billing)
            // For other measurands, store in the meterValue JSON
            if (measurand === 'Energy.Active.Import.Register' || !sampledValue.measurand) {
              await this.sessionsService.addMeterValue(
                session.id,
                timestamp,
                numericValue,
                {
                  ...meterValue,
                  sampledValue: [sampledValue], // Store this specific sampled value
                },
              );
              processedCount++;
            } else {
              // Store non-energy measurands in the meterValue JSON
              await this.sessionsService.addMeterValue(
                session.id,
                timestamp,
                0, // No energy value for this reading
                {
                  ...meterValue,
                  sampledValue: [sampledValue],
                },
              );
              processedCount++;
            }
          }
        }

        // Log summary with measurand breakdown
        const measurandSummary = Object.entries(measurandCounts)
          .map(([m, count]) => `${m}=${count}`)
          .join(', ');

        this.logger.log(
          `[${cpId}] Stored ${processedCount} meter values for transaction ${payload.transactionId}. ` +
          `Measurands: ${measurandSummary}`
        );
      } else {
        // No transaction ID - periodic meter values (charge point level)
        this.logger.debug(`[${cpId}] Received ${payload.meterValue.length} periodic meter values (no transaction)`);
      }

      return {};
    } catch (error) {
      this.logger.error(`[${cpId}] MeterValues error: ${error.message}`, error.stack);
      return {}; // Return empty response - MeterValues doesn't return errors
    }
  }
}
