import { Module } from '@nestjs/common';
import { PrismaService } from '../config/database.config';
import { StationsService } from './stations/stations.service';
import { ConnectorsService } from './connectors/connectors.service';
import { SessionsService } from './sessions/sessions.service';
import { RfidService } from './rfid/rfid.service';
import { ReservationsService } from './reservations/reservations.service';
import { ModelsService } from './models/models.service';
import { AuditLogService } from '../audit/audit-log.service';

@Module({
  providers: [
    PrismaService,
    StationsService,
    ConnectorsService,
    SessionsService,
    RfidService,
    ReservationsService,
    ModelsService,
    AuditLogService,
  ],
  exports: [
    StationsService,
    ConnectorsService,
    SessionsService,
    RfidService,
    ReservationsService,
    ModelsService,
    AuditLogService,
  ],
})
export class ChargingModule {}