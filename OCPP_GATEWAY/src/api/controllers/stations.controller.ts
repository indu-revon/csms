import { Controller, Get, Post, Put, Delete, Param, Body, Res } from '@nestjs/common';
import { Response } from 'express';
import { StationsService } from '../../charging/stations/stations.service';
import { OcppService } from '../../ocpp/ocpp.service';
import { CreateStationDto, UpdateStationDto } from '../../charging/stations/stations.service';
import { ChargePointStatus } from '../../common/enums';

// Helper function to convert BigInt to string in JSON
function replacer(key: string, value: any) {
  if (typeof value === 'bigint') {
    return value.toString();
  }
  return value;
}

/**
 * Compute the real-time status of a charging station
 * @param dbStatus Database status
 * @param isConnected Whether the station is actively connected via WebSocket
 * @param isRecentlyActive Whether the station has sent heartbeat recently
 * @returns Computed status
 */
function computeStationStatus(
  dbStatus: string | null | undefined,
  isConnected: boolean,
  isRecentlyActive: boolean
): string {
  // Preserve MAINTENANCE and ERROR states from database
  if (dbStatus === ChargePointStatus.MAINTENANCE || dbStatus === ChargePointStatus.ERROR) {
    return dbStatus;
  }

  // If actively connected via WebSocket, it's ONLINE
  if (isConnected) {
    return ChargePointStatus.ONLINE;
  }

  // If explicitly marked OFFLINE in DB (due to clean disconnect), respect it immediately
  if (dbStatus === ChargePointStatus.OFFLINE) {
    return ChargePointStatus.OFFLINE;
  }

  // If not connected but recently active (within heartbeat threshold), still ONLINE
  // This covers "silent" drops where the server hasn't realized the connection is gone yet
  if (isRecentlyActive) {
    return ChargePointStatus.ONLINE;
  }

  // Otherwise, it's OFFLINE
  return ChargePointStatus.OFFLINE;
}

@Controller('api/stations')
export class StationsController {
  constructor(
    private readonly stationsService: StationsService,
    private readonly ocppService: OcppService,
  ) { }

  @Get()
  async findAll(@Res() res: Response) {
    try {
      const stations = await this.stationsService.findAll();
      const result = stations.map(station => {
        const isConnected = this.ocppService.isStationConnected(station.ocppIdentifier);
        const isRecentlyActive = this.stationsService.isRecentlyActive(station.lastHeartbeatAt);
        const computedStatus = computeStationStatus(station.status, isConnected, isRecentlyActive);

        return {
          ...station,
          isConnected,
          computedStatus,
        };
      });
      // Convert BigInt values to strings for JSON serialization
      const serializedResult = JSON.parse(JSON.stringify(result, replacer));
      return res.json(serializedResult);
    } catch (error) {
      console.error('Error fetching stations:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  @Get(':cpId')
  async findOne(@Param('cpId') cpId: string, @Res() res: Response) {
    try {
      const station = await this.stationsService.findByOcppIdentifier(cpId);
      const isConnected = this.ocppService.isStationConnected(cpId);
      const isRecentlyActive = this.stationsService.isRecentlyActive(station?.lastHeartbeatAt);
      const computedStatus = computeStationStatus(station?.status, isConnected, isRecentlyActive);

      const result = {
        ...station,
        isConnected,
        computedStatus,
      };
      // Convert BigInt values to strings for JSON serialization
      const serializedResult = JSON.parse(JSON.stringify(result, replacer));
      return res.json(serializedResult);
    } catch (error) {
      console.error('Error fetching station:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  @Get('connected/list')
  async getConnectedStations(@Res() res: Response) {
    try {
      const result = {
        connectedStations: this.ocppService.getConnectedStations(),
      };
      return res.json(result);
    } catch (error) {
      console.error('Error fetching connected stations:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  @Post()
  async create(@Body() createStationDto: CreateStationDto, @Res() res: Response) {
    try {
      const station = await this.stationsService.upsertStation(createStationDto);
      // Convert BigInt values to strings for JSON serialization
      const serializedResult = JSON.parse(JSON.stringify(station, replacer));
      return res.status(201).json(serializedResult);
    } catch (error) {
      console.error('Error creating station:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  @Put(':cpId')
  async update(@Param('cpId') cpId: string, @Body() updateStationDto: UpdateStationDto, @Res() res: Response) {
    try {
      // First check if the station exists
      const existingStation = await this.stationsService.findByOcppIdentifier(cpId);
      if (!existingStation) {
        return res.status(404).json({ error: 'Station not found' });
      }

      const station = await this.stationsService.updateStation(cpId, updateStationDto);
      // Convert BigInt values to strings for JSON serialization
      const serializedResult = JSON.parse(JSON.stringify(station, replacer));
      return res.json(serializedResult);
    } catch (error: any) {
      console.error('Error updating station:', error);
      if (error.code === 'P2025') {
        // Record not found
        return res.status(404).json({ error: 'Station not found' });
      }
      return res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  }

  @Delete(':cpId')
  async delete(@Param('cpId') cpId: string, @Res() res: Response) {
    try {
      // First check if the station exists
      const existingStation = await this.stationsService.findByOcppIdentifier(cpId);
      if (!existingStation) {
        return res.status(404).json({ error: 'Station not found' });
      }

      // Check if the station is currently connected
      if (this.ocppService.isStationConnected(cpId)) {
        return res.status(400).json({ error: 'Cannot delete connected station' });
      }

      // Delete the station
      await this.stationsService.deleteStation(cpId);
      return res.status(204).send();
    } catch (error: any) {
      console.error('Error deleting station:', error);
      if (error.code === 'P2025') {
        // Record not found
        return res.status(404).json({ error: 'Station not found' });
      }
      return res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  }
}