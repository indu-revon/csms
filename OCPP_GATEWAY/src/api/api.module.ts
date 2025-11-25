import { Module } from '@nestjs/common';
import { AdminController } from './controllers/admin.controller';
import { StationsController } from './controllers/stations.controller';
import { SessionsController } from './controllers/sessions.controller';
import { RfidController } from './controllers/rfid.controller';
import { ReservationsController } from './controllers/reservations.controller';
import { ModelsController } from './controllers/models.controller';
import { AuditController } from './controllers/audit.controller';
import { OcppLogsController } from './controllers/ocpp-logs.controller';
import { HealthController } from './controllers/health.controller';
import { OcppModule } from '../ocpp/ocpp.module';
import { ChargingModule } from '../charging/charging.module';
import { OcppLogsService } from './ocpp-logs.service';
import { PrismaService } from '../config/database.config';

@Module({
  imports: [OcppModule, ChargingModule],
  controllers: [
    HealthController,
    AdminController,
    StationsController,
    SessionsController,
    RfidController,
    ReservationsController,
    ModelsController,
    AuditController,
    OcppLogsController,
  ],
  providers: [OcppLogsService, PrismaService],
  exports: [OcppLogsService],
})
export class ApiModule { }