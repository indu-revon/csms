import { Injectable } from '@nestjs/common';
import { PrismaService } from '../config/database.config';
import { Driver, Prisma } from '@prisma/client';

@Injectable()
export class DriversService {
    constructor(private prisma: PrismaService) { }

    async driver(
        driverWhereUniqueInput: Prisma.DriverWhereUniqueInput,
    ): Promise<Driver | null> {
        return this.prisma.driver.findUnique({
            where: driverWhereUniqueInput,
        });
    }

    async drivers(params: {
        skip?: number;
        take?: number;
        cursor?: Prisma.DriverWhereUniqueInput;
        where?: Prisma.DriverWhereInput;
        orderBy?: Prisma.DriverOrderByWithRelationInput;
    }): Promise<Driver[]> {
        const { skip, take, cursor, where, orderBy } = params;
        return this.prisma.driver.findMany({
            skip,
            take,
            cursor,
            where,
            orderBy,
        });
    }

    async createDriver(data: Prisma.DriverCreateInput): Promise<Driver> {
        return this.prisma.driver.create({
            data,
        });
    }

    async updateDriver(params: {
        where: Prisma.DriverWhereUniqueInput;
        data: Prisma.DriverUpdateInput;
    }): Promise<Driver> {
        const { where, data } = params;
        return this.prisma.driver.update({
            data,
            where,
        });
    }

    async deleteDriver(where: Prisma.DriverWhereUniqueInput): Promise<Driver> {
        return this.prisma.driver.delete({
            where,
        });
    }

    // Wallet Operations
    async topUpWallet(id: number, amount: number): Promise<Driver> {
        return this.prisma.driver.update({
            where: { id },
            data: {
                balance: { increment: amount },
            },
        });
    }

    async deductWallet(id: number, amount: number): Promise<Driver> {
        return this.prisma.driver.update({
            where: { id },
            data: {
                balance: { decrement: amount },
            },
        });
    }

    async freezeBalance(id: number, amount: number): Promise<Driver> {
        // Move amount from balance to holdBalance
        // This assumes validation is done before calling this (e.g. check sufficient balance)
        return this.prisma.$transaction(async (prisma) => {
            const driver = await prisma.driver.findUnique({ where: { id } });
            if (!driver || driver.balance < amount) {
                throw new Error('Insufficient balance');
            }
            return prisma.driver.update({
                where: { id },
                data: {
                    balance: { decrement: amount },
                    holdBalance: { increment: amount },
                },
            });
        });
    }

    async unfreezeBalance(id: number, amount: number): Promise<Driver> {
        return this.prisma.$transaction(async (prisma) => {
            const driver = await prisma.driver.findUnique({ where: { id } });
            if (!driver || driver.holdBalance < amount) {
                throw new Error('Insufficient hold balance');
            }
            return prisma.driver.update({
                where: { id },
                data: {
                    balance: { increment: amount },
                    holdBalance: { decrement: amount },
                },
            });
        });
    }
}
