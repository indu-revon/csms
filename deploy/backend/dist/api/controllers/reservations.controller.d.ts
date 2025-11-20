import { ReservationsService, CreateReservationDto, UpdateReservationDto } from '../../charging/reservations/reservations.service';
export declare class ReservationsController {
    private readonly reservationsService;
    constructor(reservationsService: ReservationsService);
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
    findOne(id: number): Promise<{
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
    create(data: CreateReservationDto): Promise<{
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
    update(id: number, data: UpdateReservationDto): Promise<{
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
    delete(id: number): Promise<{
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
}
