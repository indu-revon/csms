import { Module } from '@nestjs/common';
import { OcppService } from './ocpp.service';
import { RemoteControlService } from './remote-control.service';
import { ChargingModule } from '../charging/charging.module';
import { OcppLogsService } from '../api/ocpp-logs.service';
import { PrismaService } from '../config/database.config';
import { BootNotificationHandler } from './handlers/boot-notification.handler';
import { HeartbeatHandler } from './handlers/heartbeat.handler';
import { StatusNotificationHandler } from './handlers/status-notification.handler';
import { AuthorizeHandler } from './handlers/authorize.handler';
import { StartTransactionHandler } from './handlers/start-transaction.handler';
import { StopTransactionHandler } from './handlers/stop-transaction.handler';
import { MeterValuesHandler } from './handlers/meter-values.handler';
import { DataTransferHandler } from './handlers/data-transfer.handler';

@Module({
  imports: [ChargingModule],
  providers: [
    OcppService,
    RemoteControlService,
    OcppLogsService,
    PrismaService,
    BootNotificationHandler,
    HeartbeatHandler,
    StatusNotificationHandler,
    AuthorizeHandler,
    StartTransactionHandler,
    StopTransactionHandler,
    MeterValuesHandler,
    DataTransferHandler,
  ],
  exports: [OcppService, RemoteControlService],
})
export class OcppModule { }