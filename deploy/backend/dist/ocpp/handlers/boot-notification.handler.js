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
exports.BootNotificationHandler = void 0;
const common_1 = require("@nestjs/common");
const stations_service_1 = require("../../charging/stations/stations.service");
let BootNotificationHandler = class BootNotificationHandler {
    constructor(stationsService) {
        this.stationsService = stationsService;
        this.heartbeatInterval = parseInt(process.env.HEARTBEAT_INTERVAL || '60', 10);
    }
    async handle(cpId, payload) {
        const existingStation = await this.stationsService.findByOcppIdentifier(cpId);
        if (!existingStation) {
            const now = new Date().toISOString();
            return {
                status: 'Rejected',
                currentTime: now,
                interval: this.heartbeatInterval,
            };
        }
        await this.stationsService.upsertStation({
            ocppIdentifier: cpId,
            vendor: payload.chargePointVendor,
            model: payload.chargePointModel,
            serialNumber: payload.chargePointSerialNumber,
            firmwareVersion: payload.firmwareVersion,
        });
        const now = new Date().toISOString();
        const status = process.env.BOOT_NOTIFICATION_STATUS || 'Accepted';
        return {
            status: status,
            currentTime: now,
            interval: this.heartbeatInterval,
        };
    }
};
exports.BootNotificationHandler = BootNotificationHandler;
exports.BootNotificationHandler = BootNotificationHandler = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [stations_service_1.StationsService])
], BootNotificationHandler);
//# sourceMappingURL=boot-notification.handler.js.map