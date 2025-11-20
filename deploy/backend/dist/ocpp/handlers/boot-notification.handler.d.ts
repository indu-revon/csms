import { StationsService } from '../../charging/stations/stations.service';
import { BootNotificationRequest, BootNotificationResponse } from '../dtos/boot-notification.dto';
export declare class BootNotificationHandler {
    private readonly stationsService;
    private readonly heartbeatInterval;
    constructor(stationsService: StationsService);
    handle(cpId: string, payload: BootNotificationRequest): Promise<BootNotificationResponse>;
}
