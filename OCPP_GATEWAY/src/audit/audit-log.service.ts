import { Injectable } from '@nestjs/common';
import { PrismaService } from '../config/database.config';

export interface CreateAuditLogDto {
  userId?: number;
  actionType: string;
  targetType: string;
  targetId?: number;
  chargingStationId?: number;
  metadata?: any;
  status?: string;
  request?: any;
  response?: any;
}

@Injectable()
export class AuditLogService {
  constructor(private readonly prisma: PrismaService) {}

  async createAuditLog(data: CreateAuditLogDto) {
    return this.prisma.auditLog.create({
      data: {
        userId: data.userId,
        actionType: data.actionType,
        targetType: data.targetType,
        targetId: data.targetId,
        chargingStationId: data.chargingStationId,
        metadata: data.metadata ? JSON.stringify(data.metadata) : null,
        status: data.status,
        request: data.request ? JSON.stringify(data.request) : null,
        response: data.response ? JSON.stringify(data.response) : null,
      },
    });
  }

  async getAuditLogsByStationId(stationId: number, limit = 50) {
    return this.prisma.auditLog.findMany({
      where: {
        chargingStationId: stationId,
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: limit,
    });
  }
}