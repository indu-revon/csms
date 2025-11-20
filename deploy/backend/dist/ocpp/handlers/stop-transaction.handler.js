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
exports.StopTransactionHandler = void 0;
const common_1 = require("@nestjs/common");
const stations_service_1 = require("../../charging/stations/stations.service");
const sessions_service_1 = require("../../charging/sessions/sessions.service");
let StopTransactionHandler = class StopTransactionHandler {
    constructor(stationsService, sessionsService) {
        this.stationsService = stationsService;
        this.sessionsService = sessionsService;
    }
    async handle(cpId, payload) {
        const station = await this.stationsService.findByOcppIdentifier(cpId);
        if (!station) {
            throw new Error(`Station not found: ${cpId}`);
        }
        const session = await this.sessionsService.findActiveSession(station.id, payload.transactionId);
        if (!session) {
            throw new Error(`Session not found: ${payload.transactionId}`);
        }
        let energyKwh;
        if (payload.meterStop && session.startMeterValue) {
            energyKwh = (payload.meterStop - session.startMeterValue) / 1000;
        }
        await this.sessionsService.stopSession(station.id, payload.transactionId, {
            stopTimestamp: new Date(payload.timestamp),
            stopMeterValue: payload.meterStop,
            energyKwh,
        });
        return {
            idTagInfo: {
                status: 'Accepted',
            },
        };
    }
};
exports.StopTransactionHandler = StopTransactionHandler;
exports.StopTransactionHandler = StopTransactionHandler = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [stations_service_1.StationsService,
        sessions_service_1.SessionsService])
], StopTransactionHandler);
//# sourceMappingURL=stop-transaction.handler.js.map