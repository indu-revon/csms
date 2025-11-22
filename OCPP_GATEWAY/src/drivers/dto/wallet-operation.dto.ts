import { IsNumber, IsPositive, Min } from 'class-validator';

export class WalletOperationDto {
    @IsNumber()
    @IsPositive()
    @Min(0.01)
    amount: number;
}
