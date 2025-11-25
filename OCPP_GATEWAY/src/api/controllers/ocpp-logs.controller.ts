import { Controller, Get, Param, Query, ParseIntPipe } from '@nestjs/common';
import { OcppLogsService, OcppLogFilters } from '../ocpp-logs.service';

@Controller('api/ocpp-logs')
export class OcppLogsController {
    constructor(private readonly ocppLogsService: OcppLogsService) { }

    @Get()
    async findAll(
        @Query('search') search?: string,
        @Query('stationId', new ParseIntPipe({ optional: true })) stationId?: number,
        @Query('direction') direction?: 'INCOMING' | 'OUTGOING',
        @Query('logType') logType?: 'CALL' | 'CALL_RESULT' | 'CALL_ERROR',
        @Query('actionType') actionType?: string,
        @Query('page', new ParseIntPipe({ optional: true })) page?: number,
        @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    ) {
        const filters: OcppLogFilters = {
            search,
            stationId,
            direction,
            logType,
            actionType,
            page: page || 1,
            limit: limit || 10,
        };

        return this.ocppLogsService.findAll(filters);
    }

    @Get('station/:cpId')
    async findByStation(
        @Param('cpId') cpId: string,

        @Query('search') search?: string,
        @Query('direction') direction?: 'INCOMING' | 'OUTGOING',
        @Query('logType') logType?: 'CALL' | 'CALL_RESULT' | 'CALL_ERROR',
        @Query('actionType') actionType?: string,
        @Query('page', new ParseIntPipe({ optional: true })) page?: number,
        @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    ) {
        const filters: Omit<OcppLogFilters, 'stationId'> = {


            search,
            direction,
            logType,
            actionType,
            page: page || 1,
            limit: limit || 10,
        };

        return this.ocppLogsService.findByStation(cpId, filters);
    }

    @Get(':id')
    async findById(@Param('id', ParseIntPipe) id: number) {
        const log = await this.ocppLogsService.findById(id);

        if (!log) {
            throw new Error(`OCPP log with ID ${id} not found`);
        }

        return log;
    }
}
