import { Controller, Post, Body, Param, Inject } from '@nestjs/common';
import { RemoteControlService } from '../../ocpp/remote-control.service';
import { AuditLogService } from '../../audit/audit-log.service';
import { StationsService } from '../../charging/stations/stations.service';

@Controller('api/admin')
export class AdminController {
  constructor(
    private readonly remoteControlService: RemoteControlService,
    private readonly auditLogService: AuditLogService,
    private readonly stationsService: StationsService,
  ) { }

  private async logAudit(cpId: string, actionType: string, request: any, response: any, status: string) {
    try {
      // Look up the station by ocppIdentifier to get the database ID
      const station = await this.stationsService.findByOcppIdentifier(cpId);
      const stationId = station ? station.id : null;

      await this.auditLogService.createAuditLog({
        actionType,
        targetType: 'STATION',
        chargingStationId: stationId,
        status,
        request,
        response: typeof response === 'object' ? response : { message: response },
      });
    } catch (error) {
      // Log the error but don't throw it to avoid breaking the main functionality
      console.error('Failed to log audit:', error);
    }
  }

  @Post(':cpId/start-transaction')
  async startTransaction(
    @Param('cpId') cpId: string,
    @Body() data: { connectorId?: number; idTag: string },
  ) {
    try {
      const result = await this.remoteControlService.remoteStartTransaction(cpId, data);

      // Log successful action
      await this.logAudit(cpId, 'REMOTE_START', data, result, 'SUCCESS');

      return result;
    } catch (error) {
      // Log failed action
      await this.logAudit(cpId, 'REMOTE_START', data, { error: error.message }, 'FAILED');

      throw error;
    }
  }

  @Post(':cpId/stop-transaction')
  async stopTransaction(
    @Param('cpId') cpId: string,
    @Body() data: { transactionId: number },
  ) {
    try {
      const result = await this.remoteControlService.remoteStopTransaction(cpId, data);

      // Log successful action
      await this.logAudit(cpId, 'REMOTE_STOP', data, result, 'SUCCESS');

      return result;
    } catch (error) {
      // Log failed action
      await this.logAudit(cpId, 'REMOTE_STOP', data, { error: error.message }, 'FAILED');

      throw error;
    }
  }

  @Post(':cpId/change-availability')
  async changeAvailability(
    @Param('cpId') cpId: string,
    @Body() data: { connectorId: number; type: 'Inoperative' | 'Operative' },
  ) {
    try {
      const result = await this.remoteControlService.changeAvailability(cpId, data);

      // Log successful action
      await this.logAudit(cpId, 'CHANGE_AVAILABILITY', data, result, 'SUCCESS');

      return result;
    } catch (error) {
      // Log failed action
      await this.logAudit(cpId, 'CHANGE_AVAILABILITY', data, { error: error.message }, 'FAILED');

      throw error;
    }
  }

  @Post(':cpId/reset')
  async reset(
    @Param('cpId') cpId: string,
    @Body() data?: { type?: 'Hard' | 'Soft' },
  ) {
    try {
      const result = await this.remoteControlService.reset(cpId, data?.type);

      // Log successful action
      await this.logAudit(cpId, 'RESET', data, result, 'SUCCESS');

      return result;
    } catch (error) {
      // Log failed action
      await this.logAudit(cpId, 'RESET', data, { error: error.message }, 'FAILED');

      throw error;
    }
  }

  @Post(':cpId/unlock-connector')
  async unlockConnector(
    @Param('cpId') cpId: string,
    @Body() data: { connectorId: number },
  ) {
    try {
      const result = await this.remoteControlService.unlockConnector(cpId, data.connectorId);

      // Log successful action
      await this.logAudit(cpId, 'UNLOCK_CONNECTOR', data, result, 'SUCCESS');

      return result;
    } catch (error) {
      // Log failed action
      await this.logAudit(cpId, 'UNLOCK_CONNECTOR', data, { error: error.message }, 'FAILED');

      throw error;
    }
  }

  @Post(':cpId/get-configuration')
  async getConfiguration(
    @Param('cpId') cpId: string,
    @Body() data?: { key?: string[] },
  ) {
    try {
      const result = await this.remoteControlService.getConfiguration(cpId, data?.key);

      // Log successful action
      await this.logAudit(cpId, 'GET_CONFIGURATION', data, result, 'SUCCESS');

      return result;
    } catch (error) {
      // Log failed action
      await this.logAudit(cpId, 'GET_CONFIGURATION', data, { error: error.message }, 'FAILED');

      throw error;
    }
  }

  @Post(':cpId/change-configuration')
  async changeConfiguration(
    @Param('cpId') cpId: string,
    @Body() data: { key: string; value: string },
  ) {
    try {
      const result = await this.remoteControlService.changeConfiguration(cpId, data.key, data.value);

      // Log successful action
      await this.logAudit(cpId, 'CHANGE_CONFIGURATION', data, result, 'SUCCESS');

      return result;
    } catch (error) {
      // Log failed action
      await this.logAudit(cpId, 'CHANGE_CONFIGURATION', data, { error: error.message }, 'FAILED');

      throw error;
    }
  }

  @Post(':cpId/clear-cache')
  async clearCache(@Param('cpId') cpId: string) {
    try {
      const result = await this.remoteControlService.clearCache(cpId);
      await this.logAudit(cpId, 'CLEAR_CACHE', {}, result, 'SUCCESS');
      return result;
    } catch (error) {
      await this.logAudit(cpId, 'CLEAR_CACHE', {}, { error: error.message }, 'FAILED');
      throw error;
    }
  }

  @Post(':cpId/trigger-message')
  async triggerMessage(
    @Param('cpId') cpId: string,
    @Body() data: { requestedMessage: string; connectorId?: number },
  ) {
    try {
      const result = await this.remoteControlService.triggerMessage(cpId, data.requestedMessage, data.connectorId);
      await this.logAudit(cpId, 'TRIGGER_MESSAGE', data, result, 'SUCCESS');
      return result;
    } catch (error) {
      await this.logAudit(cpId, 'TRIGGER_MESSAGE', data, { error: error.message }, 'FAILED');
      throw error;
    }
  }

  @Post(':cpId/data-transfer')
  async dataTransfer(
    @Param('cpId') cpId: string,
    @Body() data: { vendorId: string; messageId?: string; data?: string },
  ) {
    try {
      const result = await this.remoteControlService.dataTransfer(cpId, data.vendorId, data.messageId, data.data);
      await this.logAudit(cpId, 'DATA_TRANSFER', data, result, 'SUCCESS');
      return result;
    } catch (error) {
      await this.logAudit(cpId, 'DATA_TRANSFER', data, { error: error.message }, 'FAILED');
      throw error;
    }
  }

  @Post(':cpId/reserve-now')
  async reserveNow(
    @Param('cpId') cpId: string,
    @Body() data: { connectorId: number; expiryDate: Date; idTag: string; reservationId: number; parentIdTag?: string },
  ) {
    try {
      const result = await this.remoteControlService.reserveNow(cpId, data);
      await this.logAudit(cpId, 'RESERVE_NOW', data, result, 'SUCCESS');
      return result;
    } catch (error) {
      await this.logAudit(cpId, 'RESERVE_NOW', data, { error: error.message }, 'FAILED');
      throw error;
    }
  }

  @Post(':cpId/cancel-reservation')
  async cancelReservation(
    @Param('cpId') cpId: string,
    @Body() data: { reservationId: number },
  ) {
    try {
      const result = await this.remoteControlService.cancelReservation(cpId, data.reservationId);
      await this.logAudit(cpId, 'CANCEL_RESERVATION', data, result, 'SUCCESS');
      return result;
    } catch (error) {
      await this.logAudit(cpId, 'CANCEL_RESERVATION', data, { error: error.message }, 'FAILED');
      throw error;
    }
  }
}