import { AuditLogService } from '../../audit/audit-log.service';
export declare class AuditController {
    private readonly auditLogService;
    constructor(auditLogService: AuditLogService);
    getAuditLogsByStationId(stationId: number): Promise<{
        timestamp: Date;
        id: number;
        status: string | null;
        chargingStationId: number | null;
        userId: number | null;
        actionType: string;
        targetType: string;
        targetId: number | null;
        metadata: string | null;
        request: string | null;
        response: string | null;
    }[]>;
}
