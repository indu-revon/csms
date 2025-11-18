import { Module } from '@nestjs/common';
import { ChargingModule } from '../charging/charging.module';
import { OcppModule } from '../ocpp/ocpp.module';
import { StationsController } from './controllers/stations.controller';
import { SessionsController } from './controllers/sessions.controller';
import { RfidController } from './controllers/rfid.controller';
import { AdminController } from './controllers/admin.controller';

@Module({
  imports: [ChargingModule, OcppModule],
  controllers: [
    StationsController,
    SessionsController,
    RfidController,
    AdminController,
  ],
})
export class ApiModule {}
