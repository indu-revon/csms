import { IsString, IsInt, IsOptional, IsEnum, IsDateString, Min } from 'class-validator';

export enum ChargePointStatus {
  Available = 'Available',
  Preparing = 'Preparing',
  Charging = 'Charging',
  SuspendedEVSE = 'SuspendedEVSE',
  SuspendedEV = 'SuspendedEV',
  Finishing = 'Finishing',
  Reserved = 'Reserved',
  Unavailable = 'Unavailable',
  Faulted = 'Faulted',
}

export enum ChargePointErrorCode {
  ConnectorLockFailure = 'ConnectorLockFailure',
  EVCommunicationError = 'EVCommunicationError',
  GroundFailure = 'GroundFailure',
  HighTemperature = 'HighTemperature',
  InternalError = 'InternalError',
  LocalListConflict = 'LocalListConflict',
  NoError = 'NoError',
  OtherError = 'OtherError',
  OverCurrentFailure = 'OverCurrentFailure',
  PowerMeterFailure = 'PowerMeterFailure',
  PowerSwitchFailure = 'PowerSwitchFailure',
  ReaderFailure = 'ReaderFailure',
  ResetFailure = 'ResetFailure',
  UnderVoltage = 'UnderVoltage',
  OverVoltage = 'OverVoltage',
  WeakSignal = 'WeakSignal',
}

export class StatusNotificationRequest {
  @IsInt()
  @Min(0)
  connectorId: number;

  @IsEnum(ChargePointErrorCode)
  errorCode: ChargePointErrorCode;

  @IsEnum(ChargePointStatus)
  status: ChargePointStatus;

  @IsOptional()
  @IsString()
  info?: string;

  @IsOptional()
  @IsDateString()
  timestamp?: string;

  @IsOptional()
  @IsString()
  vendorId?: string;

  @IsOptional()
  @IsString()
  vendorErrorCode?: string;
}

export interface StatusNotificationResponse { }
