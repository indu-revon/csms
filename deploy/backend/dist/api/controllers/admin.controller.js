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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const remote_control_service_1 = require("../../ocpp/remote-control.service");
const audit_log_service_1 = require("../../audit/audit-log.service");
const stations_service_1 = require("../../charging/stations/stations.service");
let AdminController = class AdminController {
    constructor(remoteControlService, auditLogService, stationsService) {
        this.remoteControlService = remoteControlService;
        this.auditLogService = auditLogService;
        this.stationsService = stationsService;
    }
    async logAudit(cpId, actionType, request, response, status) {
        try {
            const station = await this.stationsService.findByOcppIdentifier(cpId);
            const stationId = station ? station.id : null;
            await this.auditLogService.createAuditLog({
                actionType,
                targetType: 'STATION',
                chargingStationId: stationId,
                status,
                request,
                response: typeof response === 'object' ? response : { message: response },
            });
        }
        catch (error) {
            console.error('Failed to log audit:', error);
        }
    }
    async startTransaction(cpId, data) {
        try {
            const result = await this.remoteControlService.remoteStartTransaction(cpId, data);
            await this.logAudit(cpId, 'REMOTE_START', data, result, 'SUCCESS');
            return result;
        }
        catch (error) {
            await this.logAudit(cpId, 'REMOTE_START', data, { error: error.message }, 'FAILED');
            throw error;
        }
    }
    async stopTransaction(cpId, data) {
        try {
            const result = await this.remoteControlService.remoteStopTransaction(cpId, data);
            await this.logAudit(cpId, 'REMOTE_STOP', data, result, 'SUCCESS');
            return result;
        }
        catch (error) {
            await this.logAudit(cpId, 'REMOTE_STOP', data, { error: error.message }, 'FAILED');
            throw error;
        }
    }
    async changeAvailability(cpId, data) {
        try {
            const result = await this.remoteControlService.changeAvailability(cpId, data);
            await this.logAudit(cpId, 'CHANGE_AVAILABILITY', data, result, 'SUCCESS');
            return result;
        }
        catch (error) {
            await this.logAudit(cpId, 'CHANGE_AVAILABILITY', data, { error: error.message }, 'FAILED');
            throw error;
        }
    }
    async reset(cpId, data) {
        try {
            const result = await this.remoteControlService.reset(cpId, data?.type);
            await this.logAudit(cpId, 'RESET', data, result, 'SUCCESS');
            return result;
        }
        catch (error) {
            await this.logAudit(cpId, 'RESET', data, { error: error.message }, 'FAILED');
            throw error;
        }
    }
    async unlockConnector(cpId, data) {
        try {
            const result = await this.remoteControlService.unlockConnector(cpId, data.connectorId);
            await this.logAudit(cpId, 'UNLOCK_CONNECTOR', data, result, 'SUCCESS');
            return result;
        }
        catch (error) {
            await this.logAudit(cpId, 'UNLOCK_CONNECTOR', data, { error: error.message }, 'FAILED');
            throw error;
        }
    }
    async getConfiguration(cpId, data) {
        try {
            const result = await this.remoteControlService.getConfiguration(cpId, data?.key);
            await this.logAudit(cpId, 'GET_CONFIGURATION', data, result, 'SUCCESS');
            return result;
        }
        catch (error) {
            await this.logAudit(cpId, 'GET_CONFIGURATION', data, { error: error.message }, 'FAILED');
            throw error;
        }
    }
    async changeConfiguration(cpId, data) {
        try {
            const result = await this.remoteControlService.changeConfiguration(cpId, data.key, data.value);
            await this.logAudit(cpId, 'CHANGE_CONFIGURATION', data, result, 'SUCCESS');
            return result;
        }
        catch (error) {
            await this.logAudit(cpId, 'CHANGE_CONFIGURATION', data, { error: error.message }, 'FAILED');
            throw error;
        }
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Post)(':cpId/start-transaction'),
    __param(0, (0, common_1.Param)('cpId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "startTransaction", null);
__decorate([
    (0, common_1.Post)(':cpId/stop-transaction'),
    __param(0, (0, common_1.Param)('cpId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "stopTransaction", null);
__decorate([
    (0, common_1.Post)(':cpId/change-availability'),
    __param(0, (0, common_1.Param)('cpId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "changeAvailability", null);
__decorate([
    (0, common_1.Post)(':cpId/reset'),
    __param(0, (0, common_1.Param)('cpId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "reset", null);
__decorate([
    (0, common_1.Post)(':cpId/unlock-connector'),
    __param(0, (0, common_1.Param)('cpId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "unlockConnector", null);
__decorate([
    (0, common_1.Post)(':cpId/get-configuration'),
    __param(0, (0, common_1.Param)('cpId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getConfiguration", null);
__decorate([
    (0, common_1.Post)(':cpId/change-configuration'),
    __param(0, (0, common_1.Param)('cpId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "changeConfiguration", null);
exports.AdminController = AdminController = __decorate([
    (0, common_1.Controller)('api/admin'),
    __metadata("design:paramtypes", [remote_control_service_1.RemoteControlService,
        audit_log_service_1.AuditLogService,
        stations_service_1.StationsService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map