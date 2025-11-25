import { IsString, IsInt, IsOptional, IsArray, ValidateNested, IsDateString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class SampledValue {
  @IsString()
  value: string;

  @IsOptional()
  @IsString()
  context?: string;

  @IsOptional()
  @IsString()
  format?: string;

  @IsOptional()
  @IsString()
  measurand?: string;

  @IsOptional()
  @IsString()
  phase?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  unit?: string;
}

export class MeterValue {
  @IsDateString()
  timestamp: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SampledValue)
  sampledValue: SampledValue[];
}

export class MeterValuesRequest {
  @IsInt()
  @Min(0)
  connectorId: number;

  @IsOptional()
  @IsInt()
  transactionId?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MeterValue)
  meterValue: MeterValue[];
}

export interface MeterValuesResponse { }
