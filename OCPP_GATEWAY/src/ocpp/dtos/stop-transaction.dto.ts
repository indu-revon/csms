import { IsString, IsInt, IsOptional, IsDateString, IsArray, IsEnum, Min } from 'class-validator';

export class StopTransactionRequest {
  @IsInt()
  @Min(0)
  transactionId: number;

  @IsDateString()
  timestamp: string;

  @IsInt()
  @Min(0)
  meterStop: number;

  @IsOptional()
  @IsString()
  idTag?: string;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsArray()
  transactionData?: any[];
}

export type IdTagStatus = 'Accepted' | 'Blocked' | 'Expired' | 'Invalid' | 'ConcurrentTx';

export interface StopTransactionResponse {
  idTagInfo?: {
    status: IdTagStatus;
    expiryDate?: string;
    parentIdTag?: string;
  };
}
