import { Module } from '@nestjs/common';
import { DriversService } from './drivers.service';
import { PrismaService } from '../config/database.config';

@Module({
    providers: [DriversService, PrismaService],
    exports: [DriversService],
})
export class DriversModule { }
