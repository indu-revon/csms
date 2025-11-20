import { StationsService } from '../../charging/stations/stations.service';
import { ConnectorsService } from '../../charging/connectors/connectors.service';
import { ReservationsService } from '../../charging/reservations/reservations.service';
import { ReserveNowRequest, ReserveNowResponse } from '../dtos/reservation.dto';
export declare class ReserveNowHandler {
    private readonly stationsService;
    private readonly connectorsService;
    private readonly reservationsService;
    constructor(stationsService: StationsService, connectorsService: ConnectorsService, reservationsService: ReservationsService);
    handle(cpId: string, payload: ReserveNowRequest): Promise<ReserveNowResponse>;
}
