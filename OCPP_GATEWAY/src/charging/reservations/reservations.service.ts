import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/database.config';

export interface CreateReservationDto {
  chargingStationId: number;
  connectorId?: number;
  ocppReservationId: number;
  ocppIdTag: string;
  expiryDatetime: Date;
}

export interface UpdateReservationDto {
  chargingStationId?: number;
  connectorId?: number;
  ocppReservationId?: number;
  ocppIdTag?: string;
  expiryDatetime?: Date;
  status?: string;
}

@Injectable()
export class ReservationsService {
  constructor(private readonly prisma: PrismaService) {}

  async createReservation(data: CreateReservationDto) {
    try {
      // Ensure proper data types
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
    } catch (error) {
      // Handle Prisma unique constraint errors
      if (error.code === 'P2002') {
        throw new Error(`A reservation with chargingStationId ${data.chargingStationId} and ocppReservationId ${data.ocppReservationId} already exists.`);
      }
      throw error;
    }
  }

  async findAll() {
    return this.prisma.reservation.findMany();
  }

  async findById(id: number) {
    return this.prisma.reservation.findUnique({
      where: {
        id: id,
      },
    });
  }

  async updateReservation(id: number, data: UpdateReservationDto) {
    try {
      // Ensure proper data types for update
      const processedData: any = { ...data };
      
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
    } catch (error) {
      // Handle Prisma record not found errors
      if (error.code === 'P2025') {
        throw new Error(`Reservation with id ${id} not found.`);
      }
      throw error;
    }
  }

  async deleteReservation(id: number) {
    try {
      return await this.prisma.reservation.delete({
        where: {
          id: id,
        },
      });
    } catch (error) {
      // Handle Prisma record not found errors
      if (error.code === 'P2025') {
        throw new Error(`Reservation with id ${id} not found.`);
      }
      throw error;
    }
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
    } catch (error) {
      // Handle Prisma record not found errors
      if (error.code === 'P2025') {
        throw new Error(`Reservation with chargingStationId ${stationId} and ocppReservationId ${reservationId} not found.`);
      }
      throw error;
    }
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