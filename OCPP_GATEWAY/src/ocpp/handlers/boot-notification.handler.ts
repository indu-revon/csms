import { Injectable, Logger } from '@nestjs/common';
import { StationsService } from '../../charging/stations/stations.service';
import { BootNotificationRequest, BootNotificationResponse } from '../dtos/boot-notification.dto';

@Injectable()
export class BootNotificationHandler {
  private readonly logger = new Logger(BootNotificationHandler.name);
  private readonly heartbeatInterval: number;

  constructor(private readonly stationsService: StationsService) {
    this.heartbeatInterval = parseInt(process.env.HEARTBEAT_INTERVAL || '60', 10);
  }

  async handle(cpId: string, payload: BootNotificationRequest): Promise<BootNotificationResponse> {
    try {
      // Validate required OCPP fields
      if (!payload.chargePointVendor || !payload.chargePointModel) {
        this.logger.warn(`[${cpId}] BootNotification missing required fields`);
        return {
          status: 'Rejected',
          currentTime: new Date().toISOString(),
          interval: this.heartbeatInterval,
        };
      }

      // Check if the station is already registered in the system
      const existingStation = await this.stationsService.findByOcppIdentifier(cpId);

      if (!existingStation) {
        // Station is not registered, reject the connection
        this.logger.warn(`[${cpId}] BootNotification rejected: Station not registered`);
        return {
          status: 'Rejected',
          currentTime: new Date().toISOString(),
          interval: this.heartbeatInterval,
        };
      }

      // Station is registered, proceed with normal boot notification handling
      // Use payload values if available, otherwise fall back to existing station data
      const serialNumber = payload.chargePointSerialNumber || payload.chargeBoxSerialNumber || existingStation.serialNumber;
      const firmwareVersion = payload.firmwareVersion || existingStation.firmwareVersion;
      const vendor = payload.chargePointVendor || existingStation.vendor;
      const model = payload.chargePointModel || existingStation.model;

      this.logger.log(`[${cpId}] BootNotification accepted: Firmware=${firmwareVersion}, Serial=${serialNumber}`);

      await this.stationsService.upsertStation({
        ocppIdentifier: cpId,
        vendor: vendor,
        model: model,
        serialNumber: serialNumber,
        firmwareVersion: firmwareVersion,
        iccid: payload.iccid,
        imsi: payload.imsi,
        meterType: payload.meterType,
        meterSerialNumber: payload.meterSerialNumber,
      });

      const now = new Date().toISOString();
      const status = process.env.BOOT_NOTIFICATION_STATUS || 'Accepted';

      return {
        status: status as 'Accepted' | 'Pending' | 'Rejected',
        currentTime: now,
        interval: this.heartbeatInterval,
      };
    } catch (error) {
      this.logger.error(`[${cpId}] BootNotification error: ${error.message}`, error.stack);
      return {
        status: 'Rejected',
        currentTime: new Date().toISOString(),
        interval: this.heartbeatInterval,
      };
    }
  }
}