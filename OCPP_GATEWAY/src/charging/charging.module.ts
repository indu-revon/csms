import { Module } from '@nestjs/common';
import { PrismaService } from '../config/database.config';
import { StationsService } from './stations/stations.service';
import { ConnectorsService } from './connectors/connectors.service';
import { SessionsService } from './sessions/sessions.service';
import { RfidService } from './rfid/rfid.service';
import { ReservationsService } from './reservations/reservations.service';

@Module({
  providers: [
    PrismaService,
    StationsService,
    ConnectorsService,
    SessionsService,
    RfidService,
    ReservationsService,
  ],
  exports: [
    StationsService,
    ConnectorsService,
    SessionsService,
    RfidService,
    ReservationsService,
  ],
})
export class ChargingModule {}
