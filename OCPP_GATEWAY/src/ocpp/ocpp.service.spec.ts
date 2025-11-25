import { Test, TestingModule } from '@nestjs/testing';
import { OcppService } from './ocpp.service';
import { StationsService } from '../charging/stations/stations.service';
import { OcppLogsService } from '../api/ocpp-logs.service';
import { BootNotificationHandler } from './handlers/boot-notification.handler';
import { HeartbeatHandler } from './handlers/heartbeat.handler';
import { StatusNotificationHandler } from './handlers/status-notification.handler';
import { AuthorizeHandler } from './handlers/authorize.handler';
import { StartTransactionHandler } from './handlers/start-transaction.handler';
import { StopTransactionHandler } from './handlers/stop-transaction.handler';
import { MeterValuesHandler } from './handlers/meter-values.handler';
import { DataTransferHandler } from './handlers/data-transfer.handler';
import { WebSocket } from 'ws';
import { OcppMessageType } from '../common/enums';

describe('OcppService', () => {
    let service: OcppService;
    let stationsService: StationsService;

    const mockStationsService = {
        findByOcppIdentifier: jest.fn(),
        markOffline: jest.fn(),
    };

    const mockOcppLogsService = {
        logMessage: jest.fn(),
    };

    const mockHandler = {
        handle: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                OcppService,
                { provide: StationsService, useValue: mockStationsService },
                { provide: OcppLogsService, useValue: mockOcppLogsService },
                { provide: BootNotificationHandler, useValue: mockHandler },
                { provide: HeartbeatHandler, useValue: mockHandler },
                { provide: StatusNotificationHandler, useValue: mockHandler },
                { provide: AuthorizeHandler, useValue: mockHandler },
                { provide: StartTransactionHandler, useValue: mockHandler },
                { provide: StopTransactionHandler, useValue: mockHandler },
                { provide: MeterValuesHandler, useValue: mockHandler },
                { provide: DataTransferHandler, useValue: mockHandler },
            ],
        }).compile();

        service = module.get<OcppService>(OcppService);
        stationsService = module.get<StationsService>(StationsService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('sendCommand', () => {
        let mockWs: any;
        const cpId = 'CP001';

        beforeEach(async () => {
            mockWs = {
                send: jest.fn(),
                on: jest.fn(),
                once: jest.fn(),
                emit: jest.fn(),
            };
            await service.registerConnection(cpId, mockWs);
        });

        it('should resolve when CALL_RESULT is received', async () => {
            const commandPromise = service.sendCommand(cpId, 'RemoteStartTransaction', { idTag: '123' });

            // Extract the sent message to get the uniqueId
            expect(mockWs.send).toHaveBeenCalled();
            const sentMessage = JSON.parse(mockWs.send.mock.calls[0][0]);
            const uniqueId = sentMessage[1];

            // Simulate response
            const response = [OcppMessageType.CALL_RESULT, uniqueId, { status: 'Accepted' }];
            await service.handleIncomingMessage(mockWs, JSON.stringify(response));

            await expect(commandPromise).resolves.toEqual({ status: 'Accepted' });
        });

        it('should reject when CALL_ERROR is received', async () => {
            const commandPromise = service.sendCommand(cpId, 'RemoteStartTransaction', { idTag: '123' });

            const sentMessage = JSON.parse(mockWs.send.mock.calls[0][0]);
            const uniqueId = sentMessage[1];

            // Simulate error response
            const response = [OcppMessageType.CALL_ERROR, uniqueId, 'InternalError', 'Something went wrong', {}];
            await service.handleIncomingMessage(mockWs, JSON.stringify(response));

            await expect(commandPromise).rejects.toThrow('OCPP Error: InternalError - Something went wrong');
        });

        it('should handle interleaved messages correctly (Concurrency Fix)', async () => {
            // 1. Send Command
            const commandPromise = service.sendCommand(cpId, 'RemoteStartTransaction', { idTag: '123' });
            const sentMessage = JSON.parse(mockWs.send.mock.calls[0][0]);
            const uniqueId = sentMessage[1];

            // 2. Simulate an unrelated incoming Heartbeat BEFORE the response
            const heartbeatMsg = [OcppMessageType.CALL, 'other-id', 'Heartbeat', {}];
            mockStationsService.findByOcppIdentifier.mockResolvedValue({ id: 1 });
            await service.handleIncomingMessage(mockWs, JSON.stringify(heartbeatMsg));

            // 3. Simulate the actual response
            const response = [OcppMessageType.CALL_RESULT, uniqueId, { status: 'Accepted' }];
            await service.handleIncomingMessage(mockWs, JSON.stringify(response));

            // 4. Verify command still resolves
            await expect(commandPromise).resolves.toEqual({ status: 'Accepted' });
        });
    });
});
