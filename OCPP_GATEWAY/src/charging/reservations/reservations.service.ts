import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/database.config';

export interface CreateReservationDto {
  chargingStationId: number;
  connectorId?: number;
  ocppReservationId: number;
  ocppIdTag: string;
  expiryDatetime: Date;
}

@Injectable()
export class ReservationsService {
  constructor(private readonly prisma: PrismaService) {}

  async createReservation(data: CreateReservationDto) {
    return this.prisma.reservation.create({
      data: {
        ...data,
        status: 'ACTIVE',
      },
    });
  }

  async findReservation(stationId: number, reservationId: number) {
    return this.prisma.reservation.findUnique({
      where: {
        chargingStationId_ocppReservationId: {
          chargingStationId: stationId,
          ocppReservationId: reservationId,
        },
      },
    });
  }

  async cancelReservation(stationId: number, reservationId: number) {
    return this.prisma.reservation.update({
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

  async findActiveReservations(stationId: number) {
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
}
