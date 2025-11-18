import { Injectable } from '@nestjs/common';
import { StationsService } from '../../charging/stations/stations.service';
import { BootNotificationRequest, BootNotificationResponse } from '../dtos/boot-notification.dto';

@Injectable()
export class BootNotificationHandler {
  private readonly heartbeatInterval: number;

  constructor(private readonly stationsService: StationsService) {
    this.heartbeatInterval = parseInt(process.env.HEARTBEAT_INTERVAL || '60', 10);
  }

  async handle(cpId: string, payload: BootNotificationRequest): Promise<BootNotificationResponse> {
    // Check if the station is already registered in the system
    const existingStation = await this.stationsService.findByOcppIdentifier(cpId);
    
    if (!existingStation) {
      // Station is not registered, reject the connection
      const now = new Date().toISOString();
      return {
        status: 'Rejected',
        currentTime: now,
        interval: this.heartbeatInterval,
      };
    }

    // Station is registered, proceed with normal boot notification handling
    await this.stationsService.upsertStation({
      ocppIdentifier: cpId,
      vendor: payload.chargePointVendor,
      model: payload.chargePointModel,
      serialNumber: payload.chargePointSerialNumber,
      firmwareVersion: payload.firmwareVersion,
    });

    const now = new Date().toISOString();
    const status = process.env.BOOT_NOTIFICATION_STATUS || 'Accepted';

    return {
      status: status as 'Accepted' | 'Pending' | 'Rejected',
      currentTime: now,
      interval: this.heartbeatInterval,
    };
  }
}