import { Injectable } from '@nestjs/common';
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
  stopReason?: string;
  energyKwh?: number;
}

@Injectable()
export class SessionsService {
  constructor(private readonly prisma: PrismaService) { }

  async createSession(data: CreateSessionDto) {
    return this.prisma.chargingSession.create({
      data: {
        ...data,
        sessionStatus: 'ACTIVE',
      },
    });
  }

  async findActiveSession(stationId: number, transactionId: number) {
    return this.prisma.chargingSession.findUnique({
      where: {
        chargingStationId_ocppTransactionId: {
          chargingStationId: stationId,
          ocppTransactionId: transactionId,
        },
      },
    });
  }

  async stopSession(stationId: number, transactionId: number, data: StopSessionDto) {
    return this.prisma.chargingSession.update({
      where: {
        chargingStationId_ocppTransactionId: {
          chargingStationId: stationId,
          ocppTransactionId: transactionId,
        },
      },
      data: {
        ...data,
        sessionStatus: 'COMPLETED',
      },
    });
  }

  async addMeterValue(sessionId: number, timestamp: Date, meterValue: number, rawJson?: any) {
    return this.prisma.meterValue.create({
      data: {
        chargingSessionId: sessionId,
        timestamp,
        meterValue,
        rawJson: rawJson ? JSON.stringify(rawJson) : null,
      },
    });
  }

  async findSessionsByStation(stationId: number) {
    return this.prisma.chargingSession.findMany({
      where: { chargingStationId: stationId },
      include: {
        meterValues: true,
      },
      orderBy: {
        startTimestamp: 'desc',
      },
    });
  }

  async findAllSessions(limit = 100) {
    return this.prisma.chargingSession.findMany({
      take: limit,
      include: {
        chargingStation: true,
        connector: true,
        meterValues: true,
      },
      orderBy: {
        startTimestamp: 'desc',
      },
    });
  }

  async findActiveSessions(filters?: {
    search?: string;
    stationId?: number;
    connectorId?: number;
    idTag?: string;
    page?: number;
    limit?: number;
  }) {
    const page = filters?.page || 1;
    const limit = filters?.limit || 100;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      sessionStatus: 'ACTIVE',
    };

    if (filters?.stationId) {
      where.chargingStationId = filters.stationId;
    }

    if (filters?.connectorId) {
      where.connectorId = filters.connectorId;
    }

    if (filters?.idTag) {
      where.ocppIdTag = {
        contains: filters.idTag,
        mode: 'insensitive',
      };
    }

    // Search across multiple fields
    if (filters?.search) {
      where.OR = [
        {
          ocppIdTag: {
            contains: filters.search,
            mode: 'insensitive',
          },
        },
        {
          chargingStation: {
            ocppIdentifier: {
              contains: filters.search,
              mode: 'insensitive',
            },
          },
        },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.chargingSession.findMany({
        where,
        include: {
          chargingStation: true,
          connector: true,
          meterValues: {
            orderBy: {
              timestamp: 'desc',
            },
            take: 10, // Latest 10 meter values
          },
        },
        orderBy: {
          startTimestamp: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.chargingSession.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findActiveSessionsByStation(stationId: number) {
    return this.prisma.chargingSession.findMany({
      where: {
        chargingStationId: stationId,
        sessionStatus: 'ACTIVE',
      },
      include: {
        chargingStation: true,
        connector: true,
      },
      orderBy: {
        startTimestamp: 'desc',
      },
    });
  }

  async updateTransactionId(sessionId: number, transactionId: number) {
    return this.prisma.chargingSession.update({
      where: { id: sessionId },
      data: { ocppTransactionId: transactionId },
    });
  }
}
