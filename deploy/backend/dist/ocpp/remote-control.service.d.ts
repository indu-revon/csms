import { OcppService } from './ocpp.service';
export interface RemoteStartTransactionDto {
    connectorId?: number;
    idTag: string;
    chargingProfile?: any;
}
export interface RemoteStopTransactionDto {
    transactionId: number;
}
export interface ChangeAvailabilityDto {
    connectorId: number;
    type: 'Inoperative' | 'Operative';
}
export declare class RemoteControlService {
    private readonly ocppService;
    constructor(ocppService: OcppService);
    remoteStartTransaction(cpId: string, data: RemoteStartTransactionDto): Promise<any>;
    remoteStopTransaction(cpId: string, data: RemoteStopTransactionDto): Promise<any>;
    changeAvailability(cpId: string, data: ChangeAvailabilityDto): Promise<any>;
    reset(cpId: string, type?: 'Hard' | 'Soft'): Promise<any>;
    unlockConnector(cpId: string, connectorId: number): Promise<any>;
    getConfiguration(cpId: string, key?: string[]): Promise<any>;
    changeConfiguration(cpId: string, key: string, value: string): Promise<any>;
}
