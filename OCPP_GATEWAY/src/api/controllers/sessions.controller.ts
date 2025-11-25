import { Controller, Get, Query, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { SessionsService } from '../../charging/sessions/sessions.service';

import { StationsService } from '../../charging/stations/stations.service';

// Helper function to convert BigInt to string in JSON
function replacer(key: string, value: any) {
  if (typeof value === 'bigint') {
    return value.toString();
  }
  return value;
}

@Controller('api/sessions')
export class SessionsController {
  constructor(
    private readonly sessionsService: SessionsService,
    private readonly stationsService: StationsService,
  ) { }

  @Get()
  async findAll(
    @Res() res: Response,
    @Query('limit') limit: string = '100',
    @Query('page') page: string = '1',
    @Query('search') search?: string,
    @Query('stationId') stationId?: string,
    @Query('connectorId') connectorId?: string,
    @Query('idTag') idTag?: string
  ) {
    try {
      const filters = {
        limit: parseInt(limit, 10),
        page: parseInt(page, 10),
        search,
        stationId: stationId ? parseInt(stationId, 10) : undefined,
        connectorId: connectorId ? parseInt(connectorId, 10) : undefined,
        idTag,
      };

      const result = await this.sessionsService.findActiveSessions(filters);

      // Convert BigInt values to strings for JSON serialization
      const serializedData = JSON.parse(JSON.stringify(result.data, replacer));

      return res.json({
        data: serializedData,
        total: result.total,
        page: result.page,
        limit: result.limit,
      });
    } catch (error) {
      console.error('Error fetching sessions:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  @Get('station/:cpId/active')
  async findActiveByStation(@Param('cpId') cpId: string, @Res() res: Response) {


    try {
      const station = await this.stationsService.findByOcppIdentifier(cpId);
      if (!station) {
        return res.status(404).json({ error: 'Station not found' });
      }
      const sessions = await this.sessionsService.findActiveSessionsByStation(station.id);
      const serializedSessions = JSON.parse(JSON.stringify(sessions, replacer));
      return res.json(serializedSessions);
    } catch (error) {
      console.error('Error fetching active sessions:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  @Get('station/:cpId')
  async findByStation(@Param('cpId') cpId: string, @Res() res: Response) {
    try {
      // This would need station ID lookup first
      // For now, simplified version
      return res.json({ message: 'Sessions by station', cpId });
    } catch (error) {
      console.error('Error fetching sessions by station:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}
