import { Module } from '@nestjs/common';
import { OcppService } from './ocpp.service';
import { RemoteControlService } from './remote-control.service';
import { ChargingModule } from '../charging/charging.module';
import { BootNotificationHandler } from './handlers/boot-notification.handler';
import { HeartbeatHandler } from './handlers/heartbeat.handler';
import { StatusNotificationHandler } from './handlers/status-notification.handler';
import { AuthorizeHandler } from './handlers/authorize.handler';
import { StartTransactionHandler } from './handlers/start-transaction.handler';
import { StopTransactionHandler } from './handlers/stop-transaction.handler';
import { MeterValuesHandler } from './handlers/meter-values.handler';
import { ReserveNowHandler } from './handlers/reserve-now.handler';
import { CancelReservationHandler } from './handlers/cancel-reservation.handler';

@Module({
  imports: [ChargingModule],
  providers: [
    OcppService,
    RemoteControlService,
    BootNotificationHandler,
    HeartbeatHandler,
    StatusNotificationHandler,
    AuthorizeHandler,
    StartTransactionHandler,
    StopTransactionHandler,
    MeterValuesHandler,
    ReserveNowHandler,
    CancelReservationHandler,
  ],
  exports: [OcppService, RemoteControlService],
})
export class OcppModule {}