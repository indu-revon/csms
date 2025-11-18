import { Injectable } from '@nestjs/common';
import { StationsService } from '../../charging/stations/stations.service';
import { ReservationsService } from '../../charging/reservations/reservations.service';
import { CancelReservationRequest, CancelReservationResponse } from '../dtos/reservation.dto';

@Injectable()
export class CancelReservationHandler {
  constructor(
    private readonly stationsService: StationsService,
    private readonly reservationsService: ReservationsService,
  ) {}

  async handle(cpId: string, payload: CancelReservationRequest): Promise<CancelReservationResponse> {
    const station = await this.stationsService.findByOcppIdentifier(cpId);
    
    if (!station) {
      return { status: 'Rejected' };
    }

    const reservation = await this.reservationsService.findReservation(
      station.id,
      payload.reservationId,
    );

    if (!reservation) {
      return { status: 'Rejected' };
    }

    await this.reservationsService.cancelReservation(
      station.id,
      payload.reservationId,
    );

    return { status: 'Accepted' };
  }
}
