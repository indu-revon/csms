import { IsString, IsInt, IsOptional, IsDateString, Min } from 'class-validator';

export class StartTransactionRequest {
  @IsInt()
  @Min(1)
  connectorId: number;

  @IsString()
  idTag: string;

  @IsInt()
  @Min(0)
  meterStart: number;

  @IsDateString()
  timestamp: string;

  @IsOptional()
  @IsInt()
  reservationId?: number;
}

export type IdTagStatus = 'Accepted' | 'Blocked' | 'Expired' | 'Invalid' | 'ConcurrentTx';

export interface StartTransactionResponse {
  transactionId: number;
  idTagInfo: {
    status: IdTagStatus;
    expiryDate?: string;
    parentIdTag?: string;
  };
}
