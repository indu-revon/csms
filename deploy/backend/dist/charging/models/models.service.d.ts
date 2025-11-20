import { PrismaService } from '../../config/database.config';
export interface CreateModelDto {
    name: string;
    vendor?: string;
    powerOutputKw?: number;
    maxCurrentAmp?: number;
    maxVoltageV?: number;
}
export interface UpdateModelDto {
    name?: string;
    vendor?: string;
    powerOutputKw?: number;
    maxCurrentAmp?: number;
    maxVoltageV?: number;
}
export declare class ModelsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createModel(data: CreateModelDto): Promise<{
        id: number;
        vendor: string | null;
        createdAt: Date;
        updatedAt: Date;
        powerOutputKw: number | null;
        maxCurrentAmp: number | null;
        maxVoltageV: number | null;
        name: string;
    }>;
    findAll(): Promise<{
        id: number;
        vendor: string | null;
        createdAt: Date;
        updatedAt: Date;
        powerOutputKw: number | null;
        maxCurrentAmp: number | null;
        maxVoltageV: number | null;
        name: string;
    }[]>;
    findById(id: number): Promise<{
        id: number;
        vendor: string | null;
        createdAt: Date;
        updatedAt: Date;
        powerOutputKw: number | null;
        maxCurrentAmp: number | null;
        maxVoltageV: number | null;
        name: string;
    }>;
    findByName(name: string): Promise<{
        id: number;
        vendor: string | null;
        createdAt: Date;
        updatedAt: Date;
        powerOutputKw: number | null;
        maxCurrentAmp: number | null;
        maxVoltageV: number | null;
        name: string;
    }>;
    updateModel(id: number, data: UpdateModelDto): Promise<{
        id: number;
        vendor: string | null;
        createdAt: Date;
        updatedAt: Date;
        powerOutputKw: number | null;
        maxCurrentAmp: number | null;
        maxVoltageV: number | null;
        name: string;
    }>;
    deleteModel(id: number): Promise<{
        id: number;
        vendor: string | null;
        createdAt: Date;
        updatedAt: Date;
        powerOutputKw: number | null;
        maxCurrentAmp: number | null;
        maxVoltageV: number | null;
        name: string;
    }>;
}
