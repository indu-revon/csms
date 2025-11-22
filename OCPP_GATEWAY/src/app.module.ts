import { Module } from '@nestjs/common';
import { OcppModule } from './ocpp/ocpp.module';
import { ChargingModule } from './charging/charging.module';
import { ApiModule } from './api/api.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [OcppModule, ChargingModule, ApiModule, AuthModule],
})
export class AppModule { }
