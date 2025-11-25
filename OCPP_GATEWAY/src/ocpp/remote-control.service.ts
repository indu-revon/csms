import { Injectable } from '@nestjs/common';
import { OcppService } from './ocpp.service';

export interface RemoteStartTransactionDto {
  connectorId?: number;
  idTag: string;
  chargingProfile?: any;
}

export interface RemoteStopTransactionDto {
  transactionId: number;
}

export interface ChangeAvailabilityDto {
  connectorId: number;
  type: 'Inoperative' | 'Operative';
}

@Injectable()
export class RemoteControlService {
  constructor(private readonly ocppService: OcppService) { }

  async remoteStartTransaction(cpId: string, data: RemoteStartTransactionDto) {
    return this.ocppService.sendCommand(cpId, 'RemoteStartTransaction', data);
  }

  async remoteStopTransaction(cpId: string, data: RemoteStopTransactionDto) {
    return this.ocppService.sendCommand(cpId, 'RemoteStopTransaction', data);
  }

  async changeAvailability(cpId: string, data: ChangeAvailabilityDto) {
    return this.ocppService.sendCommand(cpId, 'ChangeAvailability', data);
  }

  async reset(cpId: string, type: 'Hard' | 'Soft' = 'Soft') {
    return this.ocppService.sendCommand(cpId, 'Reset', { type });
  }

  async unlockConnector(cpId: string, connectorId: number) {
    return this.ocppService.sendCommand(cpId, 'UnlockConnector', { connectorId });
  }

  async getConfiguration(cpId: string, key?: string[]) {
    return this.ocppService.sendCommand(cpId, 'GetConfiguration', { key });
  }

  async changeConfiguration(cpId: string, key: string, value: string) {
    return this.ocppService.sendCommand(cpId, 'ChangeConfiguration', { key, value });
  }

  async reserveNow(cpId: string, data: {
    connectorId: number;
    expiryDate: Date;
    idTag: string;
    reservationId: number;
    parentIdTag?: string;
  }) {
    return this.ocppService.sendCommand(cpId, 'ReserveNow', data);
  }

  async cancelReservation(cpId: string, reservationId: number) {
    return this.ocppService.sendCommand(cpId, 'CancelReservation', { reservationId });
  }

  async clearCache(cpId: string) {
    return this.ocppService.sendCommand(cpId, 'ClearCache', {});
  }

  async triggerMessage(cpId: string, requestedMessage: string, connectorId?: number) {
    return this.ocppService.sendCommand(cpId, 'TriggerMessage', {
      requestedMessage,
      connectorId,
    });
  }

  async dataTransfer(cpId: string, vendorId: string, messageId?: string, data?: string) {
    return this.ocppService.sendCommand(cpId, 'DataTransfer', {
      vendorId,
      messageId,
      data,
    });
  }
}
