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
exports.ReserveNowHandler = void 0;
const common_1 = require("@nestjs/common");
const stations_service_1 = require("../../charging/stations/stations.service");
const connectors_service_1 = require("../../charging/connectors/connectors.service");
const reservations_service_1 = require("../../charging/reservations/reservations.service");
let ReserveNowHandler = class ReserveNowHandler {
    constructor(stationsService, connectorsService, reservationsService) {
        this.stationsService = stationsService;
        this.connectorsService = connectorsService;
        this.reservationsService = reservationsService;
    }
    async handle(cpId, payload) {
        const station = await this.stationsService.findByOcppIdentifier(cpId);
        if (!station) {
            return { status: 'Rejected' };
        }
        const connector = await this.connectorsService.findConnector(station.id, payload.connectorId);
        if (!connector) {
            return { status: 'Unavailable' };
        }
        if (connector.status === 'Faulted') {
            return { status: 'Faulted' };
        }
        if (connector.status !== 'Available') {
            return { status: 'Occupied' };
        }
        await this.reservationsService.createReservation({
            chargingStationId: station.id,
            connectorId: payload.connectorId,
            ocppReservationId: payload.reservationId,
            ocppIdTag: payload.idTag,
            expiryDatetime: new Date(payload.expiryDate),
        });
        return { status: 'Accepted' };
    }
};
exports.ReserveNowHandler = ReserveNowHandler;
exports.ReserveNowHandler = ReserveNowHandler = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [stations_service_1.StationsService,
        connectors_service_1.ConnectorsService,
        reservations_service_1.ReservationsService])
], ReserveNowHandler);
//# sourceMappingURL=reserve-now.handler.js.map