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
  energyKwh?: number;
}

@Injectable()
export class SessionsService {
  constructor(private readonly prisma: PrismaService) {}

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
}
