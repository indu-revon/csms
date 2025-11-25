import { Injectable, Logger } from '@nestjs/common';
import { StationsService } from '../../charging/stations/stations.service';
import { HeartbeatRequest, HeartbeatResponse } from '../dtos/heartbeat.dto';

@Injectable()
export class HeartbeatHandler {
  private readonly logger = new Logger(HeartbeatHandler.name);

  constructor(private readonly stationsService: StationsService) { }

  async handle(cpId: string, payload: HeartbeatRequest): Promise<HeartbeatResponse> {
    try {
      // Update last heartbeat timestamp
      await this.stationsService.updateHeartbeat(cpId);

      return {
        currentTime: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`[${cpId}] Heartbeat error: ${error.message}`, error.stack);
      // Still return current time even if database update fails
      return {
        currentTime: new Date().toISOString(),
      };
    }
  }
}
