import { IsString, IsOptional } from 'class-validator';

export class DataTransferRequest {
    @IsString()
    vendorId: string;

    @IsOptional()
    @IsString()
    messageId?: string;

    @IsOptional()
    data?: any;
}

export type DataTransferStatus = 'Accepted' | 'Rejected' | 'UnknownMessageId' | 'UnknownVendorId';

export interface DataTransferResponse {
    status: DataTransferStatus;
    data?: any;
}
