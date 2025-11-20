import { PrismaService } from '../../config/database.config';
export interface CreateRfidCardDto {
    tagId: string;
    status: string;
    validFrom?: Date;
    validUntil?: Date;
    userId?: number;
}
export declare class RfidService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    validateTag(tagId: string): Promise<boolean>;
    findByTagId(tagId: string): Promise<{
        id: number;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        tagId: string;
        validFrom: Date | null;
        validUntil: Date | null;
        userId: number | null;
    }>;
    createCard(data: CreateRfidCardDto): Promise<{
        id: number;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        tagId: string;
        validFrom: Date | null;
        validUntil: Date | null;
        userId: number | null;
    }>;
    updateCardStatus(tagId: string, status: string): Promise<{
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
}
