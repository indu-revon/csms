import { IsString, IsEnum, IsOptional } from 'class-validator';

export class AuthorizeRequest {
  @IsString()
  idTag: string;
}

export type IdTagStatus = 'Accepted' | 'Blocked' | 'Expired' | 'Invalid' | 'ConcurrentTx';

export interface AuthorizeResponse {
  idTagInfo: {
    status: IdTagStatus;
    expiryDate?: string;
    parentIdTag?: string;
  };
}
