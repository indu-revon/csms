import { StationsService } from '../../charging/stations/stations.service';
import { SessionsService } from '../../charging/sessions/sessions.service';
import { StopTransactionRequest, StopTransactionResponse } from '../dtos/stop-transaction.dto';
export declare class StopTransactionHandler {
    private readonly stationsService;
    private readonly sessionsService;
    constructor(stationsService: StationsService, sessionsService: SessionsService);
    handle(cpId: string, payload: StopTransactionRequest): Promise<StopTransactionResponse>;
}
