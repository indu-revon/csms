import { Injectable } from '@nestjs/common';
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

@Injectable()
export class ModelsService {
  constructor(private readonly prisma: PrismaService) {}

  async createModel(data: CreateModelDto) {
    return this.prisma.stationModel.create({
      data,
    });
  }

  async findAll() {
    return this.prisma.stationModel.findMany();
  }

  async findById(id: number) {
    return this.prisma.stationModel.findUnique({
      where: { id },
    });
  }

  async findByName(name: string) {
    return this.prisma.stationModel.findUnique({
      where: { name },
    });
  }

  async updateModel(id: number, data: UpdateModelDto) {
    return this.prisma.stationModel.update({
      where: { id },
      data,
    });
  }

  async deleteModel(id: number) {
    return this.prisma.stationModel.delete({
      where: { id },
    });
  }
}