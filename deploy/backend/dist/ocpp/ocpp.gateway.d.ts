import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import { OcppService } from './ocpp.service';
import { StationsService } from '../charging/stations/stations.service';
export declare class OcppGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly ocppService;
    private readonly stationsService;
    server: Server;
    private readonly logger;
    constructor(ocppService: OcppService, stationsService: StationsService);
    handleConnection(client: WebSocket, req: IncomingMessage): Promise<void>;
    handleDisconnect(client: WebSocket): Promise<void>;
    private extractCpId;
}
