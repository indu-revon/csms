import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { AuditLogService } from '../../audit/audit-log.service';

@Controller('api/audit')
export class AuditController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get('station/:stationId')
  async getAuditLogsByStationId(
    @Param('stationId', ParseIntPipe) stationId: number,
  ) {
    return this.auditLogService.getAuditLogsByStationId(stationId);
  }
}