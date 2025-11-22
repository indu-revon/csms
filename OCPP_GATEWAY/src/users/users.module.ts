import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from '../config/database.config';

@Module({
    providers: [UsersService, PrismaService],
    exports: [UsersService],
})
export class UsersModule { }
