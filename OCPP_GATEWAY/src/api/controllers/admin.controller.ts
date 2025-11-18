import { Controller, Post, Body, Param } from '@nestjs/common';
import { RemoteControlService } from '../../ocpp/remote-control.service';

@Controller('api/admin')
export class AdminController {
  constructor(private readonly remoteControlService: RemoteControlService) {}

  @Post(':cpId/start-transaction')
  async startTransaction(
    @Param('cpId') cpId: string,
    @Body() data: { connectorId?: number; idTag: string },
  ) {
    return this.remoteControlService.remoteStartTransaction(cpId, data);
  }

  @Post(':cpId/stop-transaction')
  async stopTransaction(
    @Param('cpId') cpId: string,
    @Body() data: { transactionId: number },
  ) {
    return this.remoteControlService.remoteStopTransaction(cpId, data);
  }

  @Post(':cpId/change-availability')
  async changeAvailability(
    @Param('cpId') cpId: string,
    @Body() data: { connectorId: number; type: 'Inoperative' | 'Operative' },
  ) {
    return this.remoteControlService.changeAvailability(cpId, data);
  }

  @Post(':cpId/reset')
  async reset(
    @Param('cpId') cpId: string,
    @Body() data?: { type?: 'Hard' | 'Soft' },
  ) {
    return this.remoteControlService.reset(cpId, data?.type);
  }

  @Post(':cpId/unlock-connector')
  async unlockConnector(
    @Param('cpId') cpId: string,
    @Body() data: { connectorId: number },
  ) {
    return this.remoteControlService.unlockConnector(cpId, data.connectorId);
  }

  @Post(':cpId/get-configuration')
  async getConfiguration(
    @Param('cpId') cpId: string,
    @Body() data?: { key?: string[] },
  ) {
    return this.remoteControlService.getConfiguration(cpId, data?.key);
  }

  @Post(':cpId/change-configuration')
  async changeConfiguration(
    @Param('cpId') cpId: string,
    @Body() data: { key: string; value: string },
  ) {
    return this.remoteControlService.changeConfiguration(cpId, data.key, data.value);
  }
}
