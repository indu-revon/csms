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
exports.AuditLogService = void 0;
const common_1 = require("@nestjs/common");
const database_config_1 = require("../config/database.config");
let AuditLogService = class AuditLogService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createAuditLog(data) {
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
    async getAuditLogsByStationId(stationId, limit = 50) {
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
};
exports.AuditLogService = AuditLogService;
exports.AuditLogService = AuditLogService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_config_1.PrismaService])
], AuditLogService);
//# sourceMappingURL=audit-log.service.js.map