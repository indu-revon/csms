import { Module } from '@nestjs/common';
import { OcppModule } from './ocpp/ocpp.module';
import { ChargingModule } from './charging/charging.module';
import { ApiModule } from './api/api.module';

@Module({
  imports: [OcppModule, ChargingModule, ApiModule],
})
export class AppModule {}
