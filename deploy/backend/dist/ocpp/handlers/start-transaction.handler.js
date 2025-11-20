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
exports.StartTransactionHandler = void 0;
const common_1 = require("@nestjs/common");
const stations_service_1 = require("../../charging/stations/stations.service");
const sessions_service_1 = require("../../charging/sessions/sessions.service");
const rfid_service_1 = require("../../charging/rfid/rfid.service");
let StartTransactionHandler = class StartTransactionHandler {
    constructor(stationsService, sessionsService, rfidService) {
        this.stationsService = stationsService;
        this.sessionsService = sessionsService;
        this.rfidService = rfidService;
    }
    async handle(cpId, payload) {
        const isValid = await this.rfidService.validateTag(payload.idTag);
        if (!isValid) {
            return {
                transactionId: -1,
                idTagInfo: {
                    status: 'Invalid',
                },
            };
        }
        const station = await this.stationsService.findByOcppIdentifier(cpId);
        if (!station) {
            throw new Error(`Station not found: ${cpId}`);
        }
        const transactionId = Date.now() + Math.floor(Math.random() * 1000);
        await this.sessionsService.createSession({
            chargingStationId: station.id,
            connectorId: payload.connectorId,
            ocppTransactionId: transactionId,
            ocppIdTag: payload.idTag,
            startTimestamp: new Date(payload.timestamp),
            startMeterValue: payload.meterStart,
        });
        const card = await this.rfidService.findByTagId(payload.idTag);
        return {
            transactionId,
            idTagInfo: {
                status: 'Accepted',
                expiryDate: card?.validUntil?.toISOString(),
            },
        };
    }
};
exports.StartTransactionHandler = StartTransactionHandler;
exports.StartTransactionHandler = StartTransactionHandler = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [stations_service_1.StationsService,
        sessions_service_1.SessionsService,
        rfid_service_1.RfidService])
], StartTransactionHandler);
//# sourceMappingURL=start-transaction.handler.js.map