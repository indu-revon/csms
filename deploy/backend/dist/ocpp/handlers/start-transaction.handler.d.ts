import { StationsService } from '../../charging/stations/stations.service';
import { SessionsService } from '../../charging/sessions/sessions.service';
import { RfidService } from '../../charging/rfid/rfid.service';
import { StartTransactionRequest, StartTransactionResponse } from '../dtos/start-transaction.dto';
export declare class StartTransactionHandler {
    private readonly stationsService;
    private readonly sessionsService;
    private readonly rfidService;
    constructor(stationsService: StationsService, sessionsService: SessionsService, rfidService: RfidService);
    handle(cpId: string, payload: StartTransactionRequest): Promise<StartTransactionResponse>;
}
