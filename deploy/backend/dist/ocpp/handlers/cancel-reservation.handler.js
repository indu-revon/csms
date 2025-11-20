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
exports.CancelReservationHandler = void 0;
const common_1 = require("@nestjs/common");
const stations_service_1 = require("../../charging/stations/stations.service");
const reservations_service_1 = require("../../charging/reservations/reservations.service");
let CancelReservationHandler = class CancelReservationHandler {
    constructor(stationsService, reservationsService) {
        this.stationsService = stationsService;
        this.reservationsService = reservationsService;
    }
    async handle(cpId, payload) {
        const station = await this.stationsService.findByOcppIdentifier(cpId);
        if (!station) {
            return { status: 'Rejected' };
        }
        const reservation = await this.reservationsService.findReservation(station.id, payload.reservationId);
        if (!reservation) {
            return { status: 'Rejected' };
        }
        await this.reservationsService.cancelReservation(station.id, payload.reservationId);
        return { status: 'Accepted' };
    }
};
exports.CancelReservationHandler = CancelReservationHandler;
exports.CancelReservationHandler = CancelReservationHandler = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [stations_service_1.StationsService,
        reservations_service_1.ReservationsService])
], CancelReservationHandler);
//# sourceMappingURL=cancel-reservation.handler.js.map