import { ModelsService, CreateModelDto, UpdateModelDto } from '../../charging/models/models.service';
export declare class ModelsController {
    private readonly modelsService;
    constructor(modelsService: ModelsService);
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
    findOne(id: number): Promise<{
        id: number;
        vendor: string | null;
        createdAt: Date;
        updatedAt: Date;
        powerOutputKw: number | null;
        maxCurrentAmp: number | null;
        maxVoltageV: number | null;
        name: string;
    }>;
    create(data: CreateModelDto): Promise<{
        id: number;
        vendor: string | null;
        createdAt: Date;
        updatedAt: Date;
        powerOutputKw: number | null;
        maxCurrentAmp: number | null;
        maxVoltageV: number | null;
        name: string;
    }>;
    update(id: number, data: UpdateModelDto): Promise<{
        id: number;
        vendor: string | null;
        createdAt: Date;
        updatedAt: Date;
        powerOutputKw: number | null;
        maxCurrentAmp: number | null;
        maxVoltageV: number | null;
        name: string;
    }>;
    delete(id: number): Promise<{
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
