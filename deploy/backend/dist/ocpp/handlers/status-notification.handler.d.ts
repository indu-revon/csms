import { StationsService } from '../../charging/stations/stations.service';
import { ConnectorsService } from '../../charging/connectors/connectors.service';
import { StatusNotificationRequest, StatusNotificationResponse } from '../dtos/status-notification.dto';
export declare class StatusNotificationHandler {
    private readonly stationsService;
    private readonly connectorsService;
    constructor(stationsService: StationsService, connectorsService: ConnectorsService);
    handle(cpId: string, payload: StatusNotificationRequest): Promise<StatusNotificationResponse>;
}
