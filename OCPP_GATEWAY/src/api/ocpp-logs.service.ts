import { Injectable } from '@nestjs/common';
import { PrismaService } from '../config/database.config';
import { OcppMessageLog, Prisma } from '@prisma/client';

export interface OcppLogFilters {
    search?: string;
    stationId?: number;
    direction?: 'INCOMING' | 'OUTGOING';
    logType?: 'CALL' | 'CALL_RESULT' | 'CALL_ERROR';
    actionType?: string;
    page?: number;
    limit?: number;
}

export interface OcppLogResponse {
    data: OcppMessageLog[];
    total: number;
    page: number;
    limit: number;
}

@Injectable()
export class OcppLogsService {
    constructor(private prisma: PrismaService) { }

    /**
     * Log an OCPP message to the database
     */
    async logMessage(data: {
        chargingStationId: number;
        direction: 'INCOMING' | 'OUTGOING';
        logType: 'CALL' | 'CALL_RESULT' | 'CALL_ERROR';
        actionType?: string;
        messageId: string;
        request?: string;
        response?: string;
    }): Promise<OcppMessageLog> {
        return this.prisma.ocppMessageLog.create({
            data,
        });
    }

    /**
     * Get all logs with filtering and pagination
     */
    async findAll(filters: OcppLogFilters = {}): Promise<OcppLogResponse> {
        const {
            search,
            stationId,
            direction,
            logType,
            actionType,
            page = 1,
            limit = 10,
        } = filters;

        const where: Prisma.OcppMessageLogWhereInput = {};

        // Apply filters
        if (stationId) {
            where.chargingStationId = stationId;
        }

        if (direction) {
            where.direction = direction;
        }

        if (logType) {
            where.logType = logType;
        }

        if (actionType) {
            where.actionType = actionType;
        }

        // Search across multiple fields
        if (search) {
            where.OR = [
                { messageId: { contains: search } },
                { actionType: { contains: search } },
                { request: { contains: search } },
                { response: { contains: search } },
            ];
        }

        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            this.prisma.ocppMessageLog.findMany({
                where,
                include: {
                    chargingStation: {
                        select: {
                            id: true,
                            ocppIdentifier: true,
                        },
                    },
                },
                orderBy: {
                    timestamp: 'desc',
                },
                skip,
                take: limit,
            }),
            this.prisma.ocppMessageLog.count({ where }),
        ]);

        return {
            data,
            total,
            page,
            limit,
        };
    }

    /**
     * Get logs for a specific charging station
     */
    async findByStation(
        cpId: string,
        filters: Omit<OcppLogFilters, 'stationId'> = {},
    ): Promise<OcppLogResponse> {
        // Find the station first
        const station = await this.prisma.chargingStation.findUnique({
            where: { ocppIdentifier: cpId },
        });

        if (!station) {
            throw new Error(`Charging station ${cpId} not found`);
        }

        return this.findAll({
            ...filters,
            stationId: station.id,
        });
    }

    /**
     * Get a single log entry by ID
     */
    async findById(id: number): Promise<OcppMessageLog | null> {
        return this.prisma.ocppMessageLog.findUnique({
            where: { id },
            include: {
                chargingStation: {
                    select: {
                        id: true,
                        ocppIdentifier: true,
                    },
                },
            },
        });
    }
}
