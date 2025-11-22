import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateDriverDto {
    @IsString()
    @IsNotEmpty()
    @Length(2, 100)
    name: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;
}
