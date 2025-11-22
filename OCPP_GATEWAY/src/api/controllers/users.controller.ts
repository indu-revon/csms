import {
    Controller,
    Get,
    Post,
    Body,
    Put,
    Param,
    Delete,
} from '@nestjs/common';
import { UsersService } from '../../users/users.service';
import { User as UserModel } from '@prisma/client';

@Controller('api/users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get()
    async getAllUsers(): Promise<UserModel[]> {
        return this.usersService.users({});
    }

    @Get(':id')
    async getUser(@Param('id') id: string): Promise<UserModel> {
        return this.usersService.user({ id: Number(id) });
    }

    @Post()
    async signupUser(
        @Body() userData: { name: string; email: string; role: string; organization?: string; locations?: string; locationsGroup?: string; phone?: string },
    ): Promise<UserModel> {
        return this.usersService.createUser(userData);
    }

    @Put(':id')
    async updateUser(
        @Param('id') id: string,
        @Body() userData: { name?: string; email?: string; role?: string; status?: string; organization?: string; locations?: string; locationsGroup?: string; phone?: string },
    ): Promise<UserModel> {
        return this.usersService.updateUser({
            where: { id: Number(id) },
            data: userData,
        });
    }

    @Delete(':id')
    async deleteUser(@Param('id') id: string): Promise<UserModel> {
        return this.usersService.deleteUser({ id: Number(id) });
    }
}
