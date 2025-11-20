import { PrismaService } from '../../config/database.config';
export interface CreateStationDto {
    ocppIdentifier: string;
    vendor?: string;
    model?: string;
    firmwareVersion?: string;
    serialNumber?: string;
    powerOutputKw?: number;
    maxCurrentAmp?: number;
    maxVoltageV?: number;
    modelId?: number;
}
export interface UpdateStationDto {
    vendor?: string;
    model?: string;
    firmwareVersion?: string;
    serialNumber?: string;
    status?: string;
    lastHeartbeatAt?: Date;
    powerOutputKw?: number;
    maxCurrentAmp?: number;
    maxVoltageV?: number;
    modelId?: number;
}
export declare class StationsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    upsertStation(data: CreateStationDto): Promise<{
        id: number;
        ocppIdentifier: string;
        vendor: string | null;
        model: string | null;
        firmwareVersion: string | null;
        serialNumber: string | null;
        status: string | null;
        lastHeartbeatAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        powerOutputKw: number | null;
        maxCurrentAmp: number | null;
        maxVoltageV: number | null;
        modelId: number | null;
    }>;
    findByOcppIdentifier(ocppIdentifier: string): Promise<{
        stationModel: {
            id: number;
            vendor: string | null;
            createdAt: Date;
            updatedAt: Date;
            powerOutputKw: number | null;
            maxCurrentAmp: number | null;
            maxVoltageV: number | null;
            name: string;
        };
        connectors: {
            id: number;
            status: string | null;
            chargingStationId: number;
            connectorId: number;
            lastStatusAt: Date | null;
            maxPowerKw: number | null;
        }[];
    } & {
        id: number;
        ocppIdentifier: string;
        vendor: string | null;
        model: string | null;
        firmwareVersion: string | null;
        serialNumber: string | null;
        status: string | null;
        lastHeartbeatAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        powerOutputKw: number | null;
        maxCurrentAmp: number | null;
        maxVoltageV: number | null;
        modelId: number | null;
    }>;
    updateStation(ocppIdentifier: string, data: UpdateStationDto): Promise<{
        id: number;
        ocppIdentifier: string;
        vendor: string | null;
        model: string | null;
        firmwareVersion: string | null;
        serialNumber: string | null;
        status: string | null;
        lastHeartbeatAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        powerOutputKw: number | null;
        maxCurrentAmp: number | null;
        maxVoltageV: number | null;
        modelId: number | null;
    }>;
    updateHeartbeat(ocppIdentifier: string): Promise<{
        id: number;
        ocppIdentifier: string;
        vendor: string | null;
        model: string | null;
        firmwareVersion: string | null;
        serialNumber: string | null;
        status: string | null;
        lastHeartbeatAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        powerOutputKw: number | null;
        maxCurrentAmp: number | null;
        maxVoltageV: number | null;
        modelId: number | null;
    }>;
    markOffline(ocppIdentifier: string): Promise<{
        id: number;
        ocppIdentifier: string;
        vendor: string | null;
        model: string | null;
        firmwareVersion: string | null;
        serialNumber: string | null;
        status: string | null;
        lastHeartbeatAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        powerOutputKw: number | null;
        maxCurrentAmp: number | null;
        maxVoltageV: number | null;
        modelId: number | null;
    }>;
    findAll(): Promise<({
        stationModel: {
            id: number;
            vendor: string | null;
            createdAt: Date;
            updatedAt: Date;
            powerOutputKw: number | null;
            maxCurrentAmp: number | null;
            maxVoltageV: number | null;
            name: string;
        };
        connectors: {
            id: number;
            status: string | null;
            chargingStationId: number;
            connectorId: number;
            lastStatusAt: Date | null;
            maxPowerKw: number | null;
        }[];
    } & {
        id: number;
        ocppIdentifier: string;
        vendor: string | null;
        model: string | null;
        firmwareVersion: string | null;
        serialNumber: string | null;
        status: string | null;
        lastHeartbeatAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        powerOutputKw: number | null;
        maxCurrentAmp: number | null;
        maxVoltageV: number | null;
        modelId: number | null;
    })[]>;
    deleteStation(ocppIdentifier: string): Promise<{
        id: number;
        ocppIdentifier: string;
        vendor: string | null;
        model: string | null;
        firmwareVersion: string | null;
        serialNumber: string | null;
        status: string | null;
        lastHeartbeatAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        powerOutputKw: number | null;
        maxCurrentAmp: number | null;
        maxVoltageV: number | null;
        modelId: number | null;
    }>;
}
