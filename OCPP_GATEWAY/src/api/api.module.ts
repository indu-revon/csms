import { Module } from '@nestjs/common';
import { ChargingModule } from '../charging/charging.module';
import { OcppModule } from '../ocpp/ocpp.module';
import { StationsController } from './controllers/stations.controller';
import { SessionsController } from './controllers/sessions.controller';
import { RfidController } from './controllers/rfid.controller';
import { AdminController } from './controllers/admin.controller';
import { ReservationsController } from './controllers/reservations.controller';
import { ModelsController } from './controllers/models.controller';
import { AuditController } from './controllers/audit.controller';

@Module({
  imports: [ChargingModule, OcppModule],
  controllers: [
    StationsController,
    SessionsController,
    RfidController,
    AdminController,
    ReservationsController,
    ModelsController,
    AuditController,
  ],
})
export class ApiModule {}