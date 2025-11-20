import { PrismaService } from '../../config/database.config';
export interface UpdateConnectorStatusDto {
    connectorId: number;
    status: string;
    timestamp?: Date;
}
export declare class ConnectorsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    upsertConnector(stationId: number, connectorId: number, maxPowerKw?: number): Promise<{
        id: number;
        status: string | null;
        chargingStationId: number;
        connectorId: number;
        lastStatusAt: Date | null;
        maxPowerKw: number | null;
    }>;
    updateStatus(stationId: number, connectorId: number, status: string): Promise<{
        id: number;
        status: string | null;
        chargingStationId: number;
        connectorId: number;
        lastStatusAt: Date | null;
        maxPowerKw: number | null;
    }>;
    findByStation(stationId: number): Promise<{
        id: number;
        status: string | null;
        chargingStationId: number;
        connectorId: number;
        lastStatusAt: Date | null;
        maxPowerKw: number | null;
    }[]>;
    findConnector(stationId: number, connectorId: number): Promise<{
        id: number;
        status: string | null;
        chargingStationId: number;
        connectorId: number;
        lastStatusAt: Date | null;
        maxPowerKw: number | null;
    }>;
}
