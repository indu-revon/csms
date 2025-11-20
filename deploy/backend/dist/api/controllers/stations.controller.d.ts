import { Response } from 'express';
import { StationsService } from '../../charging/stations/stations.service';
import { OcppService } from '../../ocpp/ocpp.service';
import { CreateStationDto, UpdateStationDto } from '../../charging/stations/stations.service';
export declare class StationsController {
    private readonly stationsService;
    private readonly ocppService;
    constructor(stationsService: StationsService, ocppService: OcppService);
    findAll(res: Response): Promise<Response<any, Record<string, any>>>;
    findOne(cpId: string, res: Response): Promise<Response<any, Record<string, any>>>;
    getConnectedStations(res: Response): Promise<Response<any, Record<string, any>>>;
    create(createStationDto: CreateStationDto, res: Response): Promise<Response<any, Record<string, any>>>;
    update(cpId: string, updateStationDto: UpdateStationDto, res: Response): Promise<Response<any, Record<string, any>>>;
    delete(cpId: string, res: Response): Promise<Response<any, Record<string, any>>>;
}
