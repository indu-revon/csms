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
exports.ConnectorsService = void 0;
const common_1 = require("@nestjs/common");
const database_config_1 = require("../../config/database.config");
const enums_1 = require("../../common/enums");
let ConnectorsService = class ConnectorsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async upsertConnector(stationId, connectorId, maxPowerKw) {
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
                status: enums_1.ConnectorStatus.AVAILABLE,
                maxPowerKw,
                lastStatusAt: new Date(),
            },
        });
    }
    async updateStatus(stationId, connectorId, status) {
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
    async findByStation(stationId) {
        return this.prisma.connector.findMany({
            where: { chargingStationId: stationId },
        });
    }
    async findConnector(stationId, connectorId) {
        return this.prisma.connector.findUnique({
            where: {
                chargingStationId_connectorId: {
                    chargingStationId: stationId,
                    connectorId,
                },
            },
        });
    }
};
exports.ConnectorsService = ConnectorsService;
exports.ConnectorsService = ConnectorsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_config_1.PrismaService])
], ConnectorsService);
//# sourceMappingURL=connectors.service.js.map