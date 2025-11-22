import {
    Controller,
    Get,
    Post,
    Body,
    Put,
    Param,
    Delete,
    Query,
    UseGuards,
} from '@nestjs/common';
import { DriversService } from '../../drivers/drivers.service';
import { Driver as DriverModel } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { CreateDriverDto } from '../../drivers/dto/create-driver.dto';
import { UpdateDriverDto } from '../../drivers/dto/update-driver.dto';
import { WalletOperationDto } from '../../drivers/dto/wallet-operation.dto';

@Controller('api/drivers')
@UseGuards(JwtAuthGuard)
export class DriversController {
    constructor(private readonly driversService: DriversService) { }

    @Get()
    async getAllDrivers(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('search') search?: string,
        @Query('sortBy') sortBy?: string,
    ): Promise<{ data: DriverModel[]; total: number }> {
        const skip = page ? (Number(page) - 1) * Number(limit) : 0;
        const take = limit ? Number(limit) : 10;

        const where = search
            ? {
                OR: [
                    { name: { contains: search } },
                    { email: { contains: search } },
                ],
            }
            : {};

        const orderBy: any = sortBy ? { [sortBy]: 'desc' } : { createdAt: 'desc' };

        const [data, total] = await Promise.all([
            this.driversService.drivers({ skip, take, where, orderBy }),
            this.driversService.count({ where }),
        ]);

        return { data, total };
    }

    @Get(':id')
    async getDriver(@Param('id') id: string): Promise<DriverModel> {
        return this.driversService.driver({ id: Number(id) });
    }

    @Post()
    async createDriver(
        @Body() driverData: CreateDriverDto,
    ): Promise<DriverModel> {
        return this.driversService.createDriver(driverData);
    }

    @Put(':id')
    async updateDriver(
        @Param('id') id: string,
        @Body() driverData: UpdateDriverDto,
    ): Promise<DriverModel> {
        return this.driversService.updateDriver({
            where: { id: Number(id) },
            data: driverData,
        });
    }

    @Delete(':id')
    async deleteDriver(@Param('id') id: string): Promise<DriverModel> {
        return this.driversService.deleteDriver({ id: Number(id) });
    }

    // Wallet Operations
    @Post(':id/wallet/topup')
    async topUpWallet(
        @Param('id') id: string,
        @Body() body: WalletOperationDto,
    ): Promise<DriverModel> {
        return this.driversService.topUpWallet(Number(id), body.amount);
    }

    @Post(':id/wallet/deduct')
    async deductWallet(
        @Param('id') id: string,
        @Body() body: WalletOperationDto,
    ): Promise<DriverModel> {
        return this.driversService.deductWallet(Number(id), body.amount);
    }

    @Post(':id/wallet/freeze')
    async freezeBalance(
        @Param('id') id: string,
        @Body() body: WalletOperationDto,
    ): Promise<DriverModel> {
        return this.driversService.freezeBalance(Number(id), body.amount);
    }

    @Post(':id/wallet/unfreeze')
    async unfreezeBalance(
        @Param('id') id: string,
        @Body() body: WalletOperationDto,
    ): Promise<DriverModel> {
        return this.driversService.unfreezeBalance(Number(id), body.amount);
    }

    // Placeholders for Transactions and Reservations
    @Get(':id/transactions')
    async getTransactions(@Param('id') id: string) {
        // Implement fetching transactions logic here
        return [];
    }

    @Get(':id/reservations')
    async getReservations(@Param('id') id: string) {
        // Implement fetching reservations logic here
        return [];
    }
}
