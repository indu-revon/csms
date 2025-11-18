import { Injectable } from '@nestjs/common';
import { StationsService } from '../../charging/stations/stations.service';
import { ConnectorsService } from '../../charging/connectors/connectors.service';
import { StatusNotificationRequest, StatusNotificationResponse } from '../dtos/status-notification.dto';

@Injectable()
export class StatusNotificationHandler {
  constructor(
    private readonly stationsService: StationsService,
    private readonly connectorsService: ConnectorsService,
  ) {}

  async handle(cpId: string, payload: StatusNotificationRequest): Promise<StatusNotificationResponse> {
    // Find the station
    const station = await this.stationsService.findByOcppIdentifier(cpId);
    
    if (!station) {
      throw new Error(`Station not found: ${cpId}`);
    }

    // Update connector status
    await this.connectorsService.upsertConnector(
      station.id,
      payload.connectorId,
    );

    await this.connectorsService.updateStatus(
      station.id,
      payload.connectorId,
      payload.status,
    );

    return {};
  }
}
