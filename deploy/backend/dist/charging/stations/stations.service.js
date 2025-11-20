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
exports.StationsService = void 0;
const common_1 = require("@nestjs/common");
const database_config_1 = require("../../config/database.config");
const enums_1 = require("../../common/enums");
let StationsService = class StationsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async upsertStation(data) {
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
                status: enums_1.ChargePointStatus.ONLINE,
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
                status: enums_1.ChargePointStatus.MAINTENANCE,
                lastHeartbeatAt: new Date(),
            },
        });
    }
    async findByOcppIdentifier(ocppIdentifier) {
        return this.prisma.chargingStation.findUnique({
            where: { ocppIdentifier },
            include: {
                connectors: true,
                stationModel: true,
            },
        });
    }
    async updateStation(ocppIdentifier, data) {
        if (data.status) {
            const allowedStatuses = [enums_1.ChargePointStatus.MAINTENANCE, enums_1.ChargePointStatus.ERROR];
            if (!allowedStatuses.includes(data.status)) {
                throw new Error(`Invalid status. Stations can only be set to MAINTENANCE or ERROR status.`);
            }
        }
        return this.prisma.chargingStation.update({
            where: { ocppIdentifier },
            data,
        });
    }
    async updateHeartbeat(ocppIdentifier) {
        const station = await this.findByOcppIdentifier(ocppIdentifier);
        if (station && (station.status === enums_1.ChargePointStatus.MAINTENANCE || station.status === enums_1.ChargePointStatus.ERROR)) {
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
                status: enums_1.ChargePointStatus.ONLINE,
            },
        });
    }
    async markOffline(ocppIdentifier) {
        const station = await this.findByOcppIdentifier(ocppIdentifier);
        if (station && (station.status === enums_1.ChargePointStatus.MAINTENANCE || station.status === enums_1.ChargePointStatus.ERROR)) {
            return station;
        }
        return this.prisma.chargingStation.update({
            where: { ocppIdentifier },
            data: {
                status: enums_1.ChargePointStatus.OFFLINE,
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
    async deleteStation(ocppIdentifier) {
        const station = await this.prisma.chargingStation.findUnique({
            where: { ocppIdentifier },
        });
        if (!station) {
            throw new Error('Station not found');
        }
        await this.prisma.reservation.deleteMany({
            where: { chargingStationId: station.id },
        });
        const sessions = await this.prisma.chargingSession.findMany({
            where: { chargingStationId: station.id },
        });
        if (sessions.length > 0) {
            const sessionIds = sessions.map(session => session.id);
            await this.prisma.meterValue.deleteMany({
                where: { chargingSessionId: { in: sessionIds } },
            });
        }
        await this.prisma.chargingSession.deleteMany({
            where: { chargingStationId: station.id },
        });
        await this.prisma.connector.deleteMany({
            where: { chargingStationId: station.id },
        });
        return this.prisma.chargingStation.delete({
            where: { ocppIdentifier },
        });
    }
};
exports.StationsService = StationsService;
exports.StationsService = StationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_config_1.PrismaService])
], StationsService);
//# sourceMappingURL=stations.service.js.map