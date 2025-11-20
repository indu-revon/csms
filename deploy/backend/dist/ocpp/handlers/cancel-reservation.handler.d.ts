import { StationsService } from '../../charging/stations/stations.service';
import { ReservationsService } from '../../charging/reservations/reservations.service';
import { CancelReservationRequest, CancelReservationResponse } from '../dtos/reservation.dto';
export declare class CancelReservationHandler {
    private readonly stationsService;
    private readonly reservationsService;
    constructor(stationsService: StationsService, reservationsService: ReservationsService);
    handle(cpId: string, payload: CancelReservationRequest): Promise<CancelReservationResponse>;
}
