import { PrismaService } from '../../config/database.config';
export interface CreateReservationDto {
    chargingStationId: number;
    connectorId?: number;
    ocppReservationId: number;
    ocppIdTag: string;
    expiryDatetime: Date;
}
export interface UpdateReservationDto {
    chargingStationId?: number;
    connectorId?: number;
    ocppReservationId?: number;
    ocppIdTag?: string;
    expiryDatetime?: Date;
    status?: string;
}
export declare class ReservationsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createReservation(data: CreateReservationDto): Promise<{
        id: number;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        chargingStationId: number;
        connectorId: number | null;
        ocppIdTag: string;
        ocppReservationId: number;
        expiryDatetime: Date;
    }>;
    findAll(): Promise<{
        id: number;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        chargingStationId: number;
        connectorId: number | null;
        ocppIdTag: string;
        ocppReservationId: number;
        expiryDatetime: Date;
    }[]>;
    findById(id: number): Promise<{
        id: number;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        chargingStationId: number;
        connectorId: number | null;
        ocppIdTag: string;
        ocppReservationId: number;
        expiryDatetime: Date;
    }>;
    updateReservation(id: number, data: UpdateReservationDto): Promise<{
        id: number;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        chargingStationId: number;
        connectorId: number | null;
        ocppIdTag: string;
        ocppReservationId: number;
        expiryDatetime: Date;
    }>;
    deleteReservation(id: number): Promise<{
        id: number;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        chargingStationId: number;
        connectorId: number | null;
        ocppIdTag: string;
        ocppReservationId: number;
        expiryDatetime: Date;
    }>;
    findReservation(stationId: number, reservationId: number): Promise<{
        id: number;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        chargingStationId: number;
        connectorId: number | null;
        ocppIdTag: string;
        ocppReservationId: number;
        expiryDatetime: Date;
    }>;
    cancelReservation(stationId: number, reservationId: number): Promise<{
        id: number;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        chargingStationId: number;
        connectorId: number | null;
        ocppIdTag: string;
        ocppReservationId: number;
        expiryDatetime: Date;
    }>;
    findActiveReservations(stationId: number): Promise<{
        id: number;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        chargingStationId: number;
        connectorId: number | null;
        ocppIdTag: string;
        ocppReservationId: number;
        expiryDatetime: Date;
    }[]>;
    expireOldReservations(): Promise<import(".prisma/client").Prisma.BatchPayload>;
}
