import { StationsService } from '../../charging/stations/stations.service';
import { HeartbeatRequest, HeartbeatResponse } from '../dtos/heartbeat.dto';
export declare class HeartbeatHandler {
    private readonly stationsService;
    constructor(stationsService: StationsService);
    handle(cpId: string, payload: HeartbeatRequest): Promise<HeartbeatResponse>;
}
