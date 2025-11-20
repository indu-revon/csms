import { PrismaService } from '../config/database.config';
export interface CreateAuditLogDto {
    userId?: number;
    actionType: string;
    targetType: string;
    targetId?: number;
    chargingStationId?: number;
    metadata?: any;
    status?: string;
    request?: any;
    response?: any;
}
export declare class AuditLogService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createAuditLog(data: CreateAuditLogDto): Promise<{
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
    }>;
    getAuditLogsByStationId(stationId: number, limit?: number): Promise<{
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
