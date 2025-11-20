import { RfidService, CreateRfidCardDto } from '../../charging/rfid/rfid.service';
export declare class RfidController {
    private readonly rfidService;
    constructor(rfidService: RfidService);
    findAll(): Promise<{
        id: number;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        tagId: string;
        validFrom: Date | null;
        validUntil: Date | null;
        userId: number | null;
    }[]>;
    findOne(tagId: string): Promise<{
        id: number;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        tagId: string;
        validFrom: Date | null;
        validUntil: Date | null;
        userId: number | null;
    }>;
    create(data: CreateRfidCardDto): Promise<{
        id: number;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        tagId: string;
        validFrom: Date | null;
        validUntil: Date | null;
        userId: number | null;
    }>;
    blockCard(tagId: string): Promise<{
        id: number;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        tagId: string;
        validFrom: Date | null;
        validUntil: Date | null;
        userId: number | null;
    }>;
    activateCard(tagId: string): Promise<{
        id: number;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        tagId: string;
        validFrom: Date | null;
        validUntil: Date | null;
        userId: number | null;
    }>;
    deleteCard(tagId: string): Promise<{
        id: number;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        tagId: string;
        validFrom: Date | null;
        validUntil: Date | null;
        userId: number | null;
    }>;
}
