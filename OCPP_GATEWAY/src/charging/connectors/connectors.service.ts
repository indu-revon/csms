import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/database.config';
import { ConnectorStatus } from '../../common/enums';

export interface UpdateConnectorStatusDto {
  connectorId: number;
  status: string;
  timestamp?: Date;
}

@Injectable()
export class ConnectorsService {
  constructor(private readonly prisma: PrismaService) { }

  async upsertConnector(stationId: number, connectorId: number, maxPowerKw?: number) {
    return this.prisma.connector.upsert({
      where: {
        chargingStationId_connectorId: {
          chargingStationId: stationId,
          connectorId,
        },
      },
      update: {
        maxPowerKw,
        lastStatusAt: new Date(),
      },
      create: {
        chargingStationId: stationId,
        connectorId,
        status: ConnectorStatus.AVAILABLE,
        maxPowerKw,
        lastStatusAt: new Date(),
      },
    });
  }

  async updateStatus(stationId: number, connectorId: number, status: string) {
    return this.prisma.connector.update({
      where: {
        chargingStationId_connectorId: {
          chargingStationId: stationId,
          connectorId,
        },
      },
      data: {
        status,
        lastStatusAt: new Date(),
      },
    });
  }

  async findByStation(stationId: number) {
    return this.prisma.connector.findMany({
      where: { chargingStationId: stationId },
    });
  }

  async findConnector(stationId: number, connectorId: number) {
    return this.prisma.connector.findUnique({
      where: {
        chargingStationId_connectorId: {
          chargingStationId: stationId,
          connectorId,
        },
      },
    });
  }

  async updateErrorInfo(
    stationId: number,
    connectorId: number,
    errorInfo: {
      errorCode: string;
      errorInfo?: string;
      vendorErrorCode?: string;
    }
  ) {
    return this.prisma.connector.update({
      where: {
        chargingStationId_connectorId: {
          chargingStationId: stationId,
          connectorId,
        },
      },
      data: {
        errorCode: errorInfo.errorCode,
        errorInfo: errorInfo.errorInfo,
        vendorErrorCode: errorInfo.vendorErrorCode,
      },
    });
  }
}
