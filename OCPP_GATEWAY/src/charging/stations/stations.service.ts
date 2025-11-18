import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/database.config';
import { ChargePointStatus } from '../../common/enums';

export interface CreateStationDto {
  ocppIdentifier: string;
  vendor?: string;
  model?: string;
  serialNumber?: string;
  firmwareVersion?: string;
}

export interface UpdateStationDto {
  vendor?: string;
  model?: string;
  serialNumber?: string;
  firmwareVersion?: string;
  status?: string;
  lastHeartbeatAt?: Date;
}

@Injectable()
export class StationsService {
  constructor(private readonly prisma: PrismaService) {}

  async upsertStation(data: CreateStationDto) {
    return this.prisma.chargingStation.upsert({
      where: { ocppIdentifier: data.ocppIdentifier },
      update: {
        vendor: data.vendor,
        model: data.model,
        serialNumber: data.serialNumber,
        firmwareVersion: data.firmwareVersion,
        status: ChargePointStatus.ONLINE,
        lastHeartbeatAt: new Date(),
      },
      create: {
        ocppIdentifier: data.ocppIdentifier,
        vendor: data.vendor,
        model: data.model,
        serialNumber: data.serialNumber,
        firmwareVersion: data.firmwareVersion,
        status: ChargePointStatus.ONLINE,
        lastHeartbeatAt: new Date(),
      },
    });
  }

  async findByOcppIdentifier(ocppIdentifier: string) {
    return this.prisma.chargingStation.findUnique({
      where: { ocppIdentifier },
      include: {
        connectors: true,
      },
    });
  }

  async updateStation(ocppIdentifier: string, data: UpdateStationDto) {
    return this.prisma.chargingStation.update({
      where: { ocppIdentifier },
      data,
    });
  }

  async updateHeartbeat(ocppIdentifier: string) {
    return this.prisma.chargingStation.update({
      where: { ocppIdentifier },
      data: {
        lastHeartbeatAt: new Date(),
        status: ChargePointStatus.ONLINE,
      },
    });
  }

  async markOffline(ocppIdentifier: string) {
    return this.prisma.chargingStation.update({
      where: { ocppIdentifier },
      data: {
        status: ChargePointStatus.OFFLINE,
      },
    });
  }

  async findAll() {
    return this.prisma.chargingStation.findMany({
      include: {
        connectors: true,
      },
    });
  }
}
