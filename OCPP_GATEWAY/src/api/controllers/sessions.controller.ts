import { Controller, Get, Query, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { SessionsService } from '../../charging/sessions/sessions.service';

// Helper function to convert BigInt to string in JSON
function replacer(key: string, value: any) {
  if (typeof value === 'bigint') {
    return value.toString();
  }
  return value;
}

@Controller('api/sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Get()
  async findAll(@Query('limit') limit: string = '100', @Res() res: Response) {
    try {
      const limitNum = parseInt(limit, 10);
      const sessions = await this.sessionsService.findAllSessions(limitNum);
      // Convert BigInt values to strings for JSON serialization
      const serializedSessions = JSON.parse(JSON.stringify(sessions, replacer));
      return res.json(serializedSessions);
    } catch (error) {
      console.error('Error fetching sessions:', error);
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
