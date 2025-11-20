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
exports.ReservationsService = void 0;
const common_1 = require("@nestjs/common");
const database_config_1 = require("../../config/database.config");
let ReservationsService = class ReservationsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createReservation(data) {
        try {
            const processedData = {
                ...data,
                chargingStationId: Number(data.chargingStationId),
                connectorId: data.connectorId !== undefined ? (data.connectorId !== null ? Number(data.connectorId) : null) : undefined,
                ocppReservationId: Number(data.ocppReservationId),
            };
            return await this.prisma.reservation.create({
                data: {
                    ...processedData,
                    status: 'ACTIVE',
                },
            });
        }
        catch (error) {
            if (error.code === 'P2002') {
                throw new Error(`A reservation with chargingStationId ${data.chargingStationId} and ocppReservationId ${data.ocppReservationId} already exists.`);
            }
            throw error;
        }
    }
    async findAll() {
        return this.prisma.reservation.findMany();
    }
    async findById(id) {
        return this.prisma.reservation.findUnique({
            where: {
                id: id,
            },
        });
    }
    async updateReservation(id, data) {
        try {
            const processedData = { ...data };
            if (data.chargingStationId !== undefined) {
                processedData.chargingStationId = Number(data.chargingStationId);
            }
            if (data.connectorId !== undefined) {
                processedData.connectorId = data.connectorId !== null ? Number(data.connectorId) : null;
            }
            if (data.ocppReservationId !== undefined) {
                processedData.ocppReservationId = Number(data.ocppReservationId);
            }
            return await this.prisma.reservation.update({
                where: {
                    id: id,
                },
                data: processedData,
            });
        }
        catch (error) {
            if (error.code === 'P2025') {
                throw new Error(`Reservation with id ${id} not found.`);
            }
            throw error;
        }
    }
    async deleteReservation(id) {
        try {
            return await this.prisma.reservation.delete({
                where: {
                    id: id,
                },
            });
        }
        catch (error) {
            if (error.code === 'P2025') {
                throw new Error(`Reservation with id ${id} not found.`);
            }
            throw error;
        }
    }
    async findReservation(stationId, reservationId) {
        return this.prisma.reservation.findUnique({
            where: {
                chargingStationId_ocppReservationId: {
                    chargingStationId: stationId,
                    ocppReservationId: reservationId,
                },
            },
        });
    }
    async cancelReservation(stationId, reservationId) {
        try {
            return await this.prisma.reservation.update({
                where: {
                    chargingStationId_ocppReservationId: {
                        chargingStationId: stationId,
                        ocppReservationId: reservationId,
                    },
                },
                data: {
                    status: 'CANCELLED',
                },
            });
        }
        catch (error) {
            if (error.code === 'P2025') {
                throw new Error(`Reservation with chargingStationId ${stationId} and ocppReservationId ${reservationId} not found.`);
            }
            throw error;
        }
    }
    async findActiveReservations(stationId) {
        const now = new Date();
        return this.prisma.reservation.findMany({
            where: {
                chargingStationId: stationId,
                status: 'ACTIVE',
                expiryDatetime: {
                    gt: now,
                },
            },
        });
    }
    async expireOldReservations() {
        const now = new Date();
        return this.prisma.reservation.updateMany({
            where: {
                status: 'ACTIVE',
                expiryDatetime: {
                    lt: now,
                },
            },
            data: {
                status: 'EXPIRED',
            },
        });
    }
};
exports.ReservationsService = ReservationsService;
exports.ReservationsService = ReservationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_config_1.PrismaService])
], ReservationsService);
//# sourceMappingURL=reservations.service.js.map