"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionsService = void 0;
const common_1 = require("@nestjs/common");
const database_config_1 = require("../../config/database.config");
let SessionsService = class SessionsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createSession(data) {
        return this.prisma.chargingSession.create({
            data: {
                ...data,
                sessionStatus: 'ACTIVE',
            },
        });
    }
    async findActiveSession(stationId, transactionId) {
        return this.prisma.chargingSession.findUnique({
            where: {
                chargingStationId_ocppTransactionId: {
                    chargingStationId: stationId,
                    ocppTransactionId: transactionId,
                },
            },
        });
    }
    async stopSession(stationId, transactionId, data) {
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
    async addMeterValue(sessionId, timestamp, meterValue, rawJson) {
        return this.prisma.meterValue.create({
            data: {
                chargingSessionId: sessionId,
                timestamp,
                meterValue,
                rawJson: rawJson ? JSON.stringify(rawJson) : null,
            },
        });
    }
    async findSessionsByStation(stationId) {
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
};
exports.SessionsService = SessionsService;
exports.SessionsService = SessionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_config_1.PrismaService])
], SessionsService);
//# sourceMappingURL=sessions.service.js.map