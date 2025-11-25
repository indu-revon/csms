import { IsString, IsOptional, IsEnum, IsInt } from 'class-validator';

export class BootNotificationRequest {
  @IsString()
  chargePointVendor: string;

  @IsString()
  chargePointModel: string;

  @IsOptional()
  @IsString()
  chargePointSerialNumber?: string;

  @IsOptional()
  @IsString()
  chargeBoxSerialNumber?: string;

  @IsOptional()
  @IsString()
  firmwareVersion?: string;

  @IsOptional()
  @IsString()
  iccid?: string;

  @IsOptional()
  @IsString()
  imsi?: string;

  @IsOptional()
  @IsString()
  meterType?: string;

  @IsOptional()
  @IsString()
  meterSerialNumber?: string;
}

export type BootNotificationStatus = 'Accepted' | 'Pending' | 'Rejected';

export interface BootNotificationResponse {
  status: BootNotificationStatus;
  currentTime: string;
  interval: number;
}
