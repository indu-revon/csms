import { Injectable } from '@nestjs/common';
import { StationsService } from '../../charging/stations/stations.service';
import { HeartbeatRequest, HeartbeatResponse } from '../dtos/heartbeat.dto';

@Injectable()
export class HeartbeatHandler {
  constructor(private readonly stationsService: StationsService) {}

  async handle(cpId: string, payload: HeartbeatRequest): Promise<HeartbeatResponse> {
    // Update last heartbeat timestamp
    await this.stationsService.updateHeartbeat(cpId);

    return {
      currentTime: new Date().toISOString(),
    };
  }
}
