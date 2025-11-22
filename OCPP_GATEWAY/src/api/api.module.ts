import { Module } from '@nestjs/common';
import { ChargingModule } from '../charging/charging.module';
import { OcppModule } from '../ocpp/ocpp.module';
import { UsersModule } from '../users/users.module';
import { StationsController } from './controllers/stations.controller';
import { SessionsController } from './controllers/sessions.controller';
import { RfidController } from './controllers/rfid.controller';
import { ReservationsController } from './controllers/reservations.controller';
import { AuditController } from './controllers/audit.controller';
import { AdminController } from './controllers/admin.controller';
import { ModelsController } from './controllers/models.controller';
import { UsersController } from './controllers/users.controller';

@Module({
  imports: [ChargingModule, OcppModule, UsersModule],
  controllers: [
    StationsController,
    SessionsController,
    RfidController,
    ReservationsController,
    AuditController,
    AdminController,
    ModelsController,
    UsersController,
  ],
})
export class ApiModule { }