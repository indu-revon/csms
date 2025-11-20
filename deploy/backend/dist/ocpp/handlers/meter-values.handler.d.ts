import { StationsService } from '../../charging/stations/stations.service';
import { SessionsService } from '../../charging/sessions/sessions.service';
import { MeterValuesRequest, MeterValuesResponse } from '../dtos/meter-values.dto';
export declare class MeterValuesHandler {
    private readonly stationsService;
    private readonly sessionsService;
    constructor(stationsService: StationsService, sessionsService: SessionsService);
    handle(cpId: string, payload: MeterValuesRequest): Promise<MeterValuesResponse>;
}
