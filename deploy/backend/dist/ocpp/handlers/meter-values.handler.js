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
exports.MeterValuesHandler = void 0;
const common_1 = require("@nestjs/common");
const stations_service_1 = require("../../charging/stations/stations.service");
const sessions_service_1 = require("../../charging/sessions/sessions.service");
let MeterValuesHandler = class MeterValuesHandler {
    constructor(stationsService, sessionsService) {
        this.stationsService = stationsService;
        this.sessionsService = sessionsService;
    }
    async handle(cpId, payload) {
        const station = await this.stationsService.findByOcppIdentifier(cpId);
        if (!station) {
            throw new Error(`Station not found: ${cpId}`);
        }
        if (payload.transactionId) {
            const session = await this.sessionsService.findActiveSession(station.id, payload.transactionId);
            if (session) {
                for (const meterValue of payload.meterValue) {
                    const energyValue = meterValue.sampledValue.find(sv => sv.measurand === 'Energy.Active.Import.Register' || !sv.measurand);
                    if (energyValue) {
                        await this.sessionsService.addMeterValue(session.id, new Date(meterValue.timestamp), parseInt(energyValue.value, 10), meterValue);
                    }
                }
            }
        }
        return {};
    }
};
exports.MeterValuesHandler = MeterValuesHandler;
exports.MeterValuesHandler = MeterValuesHandler = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [stations_service_1.StationsService,
        sessions_service_1.SessionsService])
], MeterValuesHandler);
//# sourceMappingURL=meter-values.handler.js.map