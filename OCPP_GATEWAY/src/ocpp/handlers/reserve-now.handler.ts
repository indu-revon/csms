import { Injectable } from '@nestjs/common';
import { StationsService } from '../../charging/stations/stations.service';
import { ConnectorsService } from '../../charging/connectors/connectors.service';
import { ReservationsService } from '../../charging/reservations/reservations.service';
import { ReserveNowRequest, ReserveNowResponse } from '../dtos/reservation.dto';

@Injectable()
export class ReserveNowHandler {
  constructor(
    private readonly stationsService: StationsService,
    private readonly connectorsService: ConnectorsService,
    private readonly reservationsService: ReservationsService,
  ) {}

  async handle(cpId: string, payload: ReserveNowRequest): Promise<ReserveNowResponse> {
    const station = await this.stationsService.findByOcppIdentifier(cpId);
    
    if (!station) {
      return { status: 'Rejected' };
    }

    // Check if connector exists and is available
    const connector = await this.connectorsService.findConnector(
      station.id,
      payload.connectorId,
    );

    if (!connector) {
      return { status: 'Unavailable' };
    }

    if (connector.status === 'Faulted') {
      return { status: 'Faulted' };
    }

    if (connector.status !== 'Available') {
      return { status: 'Occupied' };
    }

    // Create reservation
    await this.reservationsService.createReservation({
      chargingStationId: station.id,
      connectorId: payload.connectorId,
      ocppReservationId: payload.reservationId,
      ocppIdTag: payload.idTag,
      expiryDatetime: new Date(payload.expiryDate),
    });

    return { status: 'Accepted' };
  }
}
