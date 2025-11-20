import { PrismaService } from '../../config/database.config';
export interface CreateSessionDto {
    chargingStationId: number;
    connectorId: number;
    ocppTransactionId: number;
    ocppIdTag: string;
    startTimestamp: Date;
    startMeterValue?: number;
}
export interface StopSessionDto {
    stopTimestamp: Date;
    stopMeterValue?: number;
    energyKwh?: number;
}
export declare class SessionsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createSession(data: CreateSessionDto): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        chargingStationId: number;
        connectorId: number;
        ocppTransactionId: bigint;
        ocppIdTag: string;
        startTimestamp: Date;
        stopTimestamp: Date | null;
        startMeterValue: number | null;
        stopMeterValue: number | null;
        energyKwh: number | null;
        sessionStatus: string | null;
    }>;
    findActiveSession(stationId: number, transactionId: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        chargingStationId: number;
        connectorId: number;
        ocppTransactionId: bigint;
        ocppIdTag: string;
        startTimestamp: Date;
        stopTimestamp: Date | null;
        startMeterValue: number | null;
        stopMeterValue: number | null;
        energyKwh: number | null;
        sessionStatus: string | null;
    }>;
    stopSession(stationId: number, transactionId: number, data: StopSessionDto): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        chargingStationId: number;
        connectorId: number;
        ocppTransactionId: bigint;
        ocppIdTag: string;
        startTimestamp: Date;
        stopTimestamp: Date | null;
        startMeterValue: number | null;
        stopMeterValue: number | null;
        energyKwh: number | null;
        sessionStatus: string | null;
    }>;
    addMeterValue(sessionId: number, timestamp: Date, meterValue: number, rawJson?: any): Promise<{
        timestamp: Date;
        meterValue: number;
        id: number;
        rawJson: string | null;
        chargingSessionId: number;
    }>;
    findSessionsByStation(stationId: number): Promise<({
        meterValues: {
            timestamp: Date;
            meterValue: number;
            id: number;
            rawJson: string | null;
            chargingSessionId: number;
        }[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        chargingStationId: number;
        connectorId: number;
        ocppTransactionId: bigint;
        ocppIdTag: string;
        startTimestamp: Date;
        stopTimestamp: Date | null;
        startMeterValue: number | null;
        stopMeterValue: number | null;
        energyKwh: number | null;
        sessionStatus: string | null;
    })[]>;
    findAllSessions(limit?: number): Promise<({
        chargingStation: {
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
        };
        connector: {
            id: number;
            status: string | null;
            chargingStationId: number;
            connectorId: number;
            lastStatusAt: Date | null;
            maxPowerKw: number | null;
        };
        meterValues: {
            timestamp: Date;
            meterValue: number;
            id: number;
            rawJson: string | null;
            chargingSessionId: number;
        }[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        chargingStationId: number;
        connectorId: number;
        ocppTransactionId: bigint;
        ocppIdTag: string;
        startTimestamp: Date;
        stopTimestamp: Date | null;
        startMeterValue: number | null;
        stopMeterValue: number | null;
        energyKwh: number | null;
        sessionStatus: string | null;
    })[]>;
}
