import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/database.config';
import { ChargePointStatus } from '../../common/enums';

export interface CreateStationDto {
  ocppIdentifier: string;
  vendor?: string;
  model?: string;
  firmwareVersion?: string;
  serialNumber?: string;
  // Hardware info
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
  // Hardware info
  powerOutputKw?: number;
  maxCurrentAmp?: number;
  maxVoltageV?: number;
  modelId?: number;
}

@Injectable()
export class StationsService {
  constructor(private readonly prisma: PrismaService) { }

  async upsertStation(data: CreateStationDto) {
    return this.prisma.chargingStation.upsert({
      where: { ocppIdentifier: data.ocppIdentifier },
      update: {
        vendor: data.vendor,
        model: data.model,
        firmwareVersion: data.firmwareVersion,
        serialNumber: data.serialNumber,
        powerOutputKw: data.powerOutputKw,
        maxCurrentAmp: data.maxCurrentAmp,
        maxVoltageV: data.maxVoltageV,
        modelId: data.modelId,
        status: ChargePointStatus.ONLINE,
        lastHeartbeatAt: new Date(),
      },
      create: {
        ocppIdentifier: data.ocppIdentifier,
        vendor: data.vendor,
        model: data.model,
        firmwareVersion: data.firmwareVersion,
        serialNumber: data.serialNumber,
        powerOutputKw: data.powerOutputKw,
        maxCurrentAmp: data.maxCurrentAmp,
        maxVoltageV: data.maxVoltageV,
        modelId: data.modelId,
        status: ChargePointStatus.MAINTENANCE, // Set new stations to maintenance by default
        lastHeartbeatAt: new Date(),
      },
    });
  }

  async findByOcppIdentifier(ocppIdentifier: string) {
    return this.prisma.chargingStation.findUnique({
      where: { ocppIdentifier },
      include: {
        connectors: true,
        stationModel: true,
      },
    });
  }

  async updateStation(ocppIdentifier: string, data: UpdateStationDto) {
    // Validate status if provided
    if (data.status) {
      const allowedStatuses = [ChargePointStatus.MAINTENANCE, ChargePointStatus.ERROR];
      const currentStation = await this.findByOcppIdentifier(ocppIdentifier);

      if (!currentStation) {
        throw new Error('Station not found');
      }

      // Allow update if status is one of the allowed statuses OR if it matches the current status
      if (!allowedStatuses.includes(data.status as ChargePointStatus) && data.status !== currentStation.status) {
        throw new Error(`Invalid status. Stations can only be set to MAINTENANCE or ERROR status.`);
      }
    }

    return this.prisma.chargingStation.update({
      where: { ocppIdentifier },
      data,
    });
  }

  async updateHeartbeat(ocppIdentifier: string) {
    // Check current status - only update if not in maintenance or error mode
    const station = await this.findByOcppIdentifier(ocppIdentifier);
    if (station && (station.status === ChargePointStatus.MAINTENANCE || station.status === ChargePointStatus.ERROR)) {
      // Don't change status for stations in maintenance or error mode
      return this.prisma.chargingStation.update({
        where: { ocppIdentifier },
        data: {
          lastHeartbeatAt: new Date(),
        },
      });
    }

    return this.prisma.chargingStation.update({
      where: { ocppIdentifier },
      data: {
        lastHeartbeatAt: new Date(),
        status: ChargePointStatus.ONLINE,
      },
    });
  }

  async markOffline(ocppIdentifier: string) {
    // Check current status - only update if not in maintenance or error mode
    const station = await this.findByOcppIdentifier(ocppIdentifier);
    if (station && (station.status === ChargePointStatus.MAINTENANCE || station.status === ChargePointStatus.ERROR)) {
      // Don't change status for stations in maintenance or error mode
      return station;
    }

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
        stationModel: true,
      },
    });
  }

  async deleteStation(ocppIdentifier: string) {
    // First, find the station to get its ID
    const station = await this.prisma.chargingStation.findUnique({
      where: { ocppIdentifier },
    });

    if (!station) {
      throw new Error('Station not found');
    }

    // Delete related records first due to foreign key constraints
    // Delete reservations
    await this.prisma.reservation.deleteMany({
      where: { chargingStationId: station.id },
    });

    // Delete meter values through charging sessions
    const sessions = await this.prisma.chargingSession.findMany({
      where: { chargingStationId: station.id },
    });

    if (sessions.length > 0) {
      const sessionIds = sessions.map(session => session.id);
      await this.prisma.meterValue.deleteMany({
        where: { chargingSessionId: { in: sessionIds } },
      });
    }

    // Delete charging sessions
    await this.prisma.chargingSession.deleteMany({
      where: { chargingStationId: station.id },
    });

    // Delete connectors
    await this.prisma.connector.deleteMany({
      where: { chargingStationId: station.id },
    });

    // Finally, delete the station itself
    return this.prisma.chargingStation.delete({
      where: { ocppIdentifier },
    });
  }
}