import { RemoteControlService } from '../../ocpp/remote-control.service';
import { AuditLogService } from '../../audit/audit-log.service';
import { StationsService } from '../../charging/stations/stations.service';
export declare class AdminController {
    private readonly remoteControlService;
    private readonly auditLogService;
    private readonly stationsService;
    constructor(remoteControlService: RemoteControlService, auditLogService: AuditLogService, stationsService: StationsService);
    private logAudit;
    startTransaction(cpId: string, data: {
        connectorId?: number;
        idTag: string;
    }): Promise<any>;
    stopTransaction(cpId: string, data: {
        transactionId: number;
    }): Promise<any>;
    changeAvailability(cpId: string, data: {
        connectorId: number;
        type: 'Inoperative' | 'Operative';
    }): Promise<any>;
    reset(cpId: string, data?: {
        type?: 'Hard' | 'Soft';
    }): Promise<any>;
    unlockConnector(cpId: string, data: {
        connectorId: number;
    }): Promise<any>;
    getConfiguration(cpId: string, data?: {
        key?: string[];
    }): Promise<any>;
    changeConfiguration(cpId: string, data: {
        key: string;
        value: string;
    }): Promise<any>;
}
