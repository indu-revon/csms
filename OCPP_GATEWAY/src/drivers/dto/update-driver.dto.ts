import { IsEmail, IsOptional, IsString, Length, IsPhoneNumber } from 'class-validator';

export class UpdateDriverDto {
    @IsString()
    @IsOptional()
    @Length(2, 100)
    name?: string;

    @IsEmail()
    @IsOptional()
    email?: string;

    @IsString()
    @IsOptional()
    phone?: string;

    @IsString()
    @IsOptional()
    virtualRfidTag?: string;
}
