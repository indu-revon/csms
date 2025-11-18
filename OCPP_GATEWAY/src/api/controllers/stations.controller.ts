import { Controller, Get, Post, Put, Param, Body, Res } from '@nestjs/common';
import { Response } from 'express';
import { StationsService } from '../../charging/stations/stations.service';
import { OcppService } from '../../ocpp/ocpp.service';
import { CreateStationDto, UpdateStationDto } from '../../charging/stations/stations.service';

// Helper function to convert BigInt to string in JSON
function replacer(key: string, value: any) {
  if (typeof value === 'bigint') {
    return value.toString();
  }
  return value;
}

@Controller('api/stations')
export class StationsController {
  constructor(
    private readonly stationsService: StationsService,
    private readonly ocppService: OcppService,
  ) {}

  @Get()
  async findAll(@Res() res: Response) {
    try {
      const stations = await this.stationsService.findAll();
      const result = stations.map(station => ({
        ...station,
        isConnected: this.ocppService.isStationConnected(station.ocppIdentifier),
      }));
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
      const result = {
        ...station,
        isConnected: this.ocppService.isStationConnected(cpId),
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
}
