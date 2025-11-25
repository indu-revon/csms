import { Test, TestingModule } from '@nestjs/testing';
import { StatusNotificationHandler } from './status-notification.handler';
import { ConnectorsService } from '../../charging/connectors/connectors.service';
import { StationsService } from '../../charging/stations/stations.service';
import { createMockStation, createMockConnector } from '../../test/factories/test-data.factory';

describe('StatusNotificationHandler', () => {
    let handler: StatusNotificationHandler;
    let connectorsService: jest.Mocked<ConnectorsService>;
    let stationsService: jest.Mocked<StationsService>;

    beforeEach(async () => {
        const mockConnectorsService = {
            updateStatus: jest.fn(),
            upsertConnector: jest.fn(),
            updateErrorInfo: jest.fn(),
        };

        const mockStationsService = {
            findByOcppIdentifier: jest.fn(),
            updateStation: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                StatusNotificationHandler,
                {
                    provide: ConnectorsService,
                    useValue: mockConnectorsService,
                },
                {
                    provide: StationsService,
                    useValue: mockStationsService,
                },
            ],
        }).compile();

        handler = module.get<StatusNotificationHandler>(StatusNotificationHandler);
        connectorsService = module.get(ConnectorsService);
        stationsService = module.get(StationsService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('handle', () => {
        const cpId = 'TEST_STATION_001';

        it('should update connector status for connector > 0', async () => {
            const mockStation = createMockStation({ id: 1, ocppIdentifier: cpId });
            stationsService.findByOcppIdentifier.mockResolvedValue(mockStation as any);
            connectorsService.updateStatus.mockResolvedValue({} as any);

            const request = {
                connectorId: 1,
                status: 'Available',
                errorCode: 'NoError',
                timestamp: new Date().toISOString(),
            } as any;

            const result = await handler.handle(cpId, request);

            expect(stationsService.findByOcppIdentifier).toHaveBeenCalledWith(cpId);
            expect(connectorsService.updateStatus).toHaveBeenCalledWith(
                1,
                1,
                'Available',
            );
            expect(result).toEqual({});
        });

        it('should update station status for connector 0', async () => {
            const mockStation = createMockStation({ id: 1, ocppIdentifier: cpId });
            stationsService.findByOcppIdentifier.mockResolvedValue(mockStation as any);
            stationsService.updateStation.mockResolvedValue({} as any);

            const request = {
                connectorId: 0,
                status: 'Unavailable',
                errorCode: 'NoError',
                timestamp: new Date().toISOString(),
            } as any;

            const result = await handler.handle(cpId, request);

            expect(stationsService.updateStation).toHaveBeenCalledWith(cpId, { status: expect.any(String) });
            expect(connectorsService.updateStatus).not.toHaveBeenCalled();
        });

        it('should handle different connector statuses', async () => {
            const mockStation = createMockStation({ id: 1 });
            stationsService.findByOcppIdentifier.mockResolvedValue(mockStation as any);

            const statuses = ['Available', 'Preparing', 'Charging', 'SuspendedEV', 'SuspendedEVSE', 'Finishing', 'Reserved', 'Unavailable', 'Faulted'];

            for (const status of statuses) {
                await handler.handle(cpId, {
                    connectorId: 1,
                    status,
                    errorCode: 'NoError',
                    timestamp: new Date().toISOString(),
                } as any);

                expect(connectorsService.updateStatus).toHaveBeenCalledWith(
                    1,
                    1,
                    status,
                );

                jest.clearAllMocks();
                stationsService.findByOcppIdentifier.mockResolvedValue(mockStation as any);
            }
        });

        it('should handle error codes', async () => {
            const mockStation = createMockStation({ id: 1 });
            stationsService.findByOcppIdentifier.mockResolvedValue(mockStation as any);

            await handler.handle(cpId, {
                connectorId: 1,
                status: 'Faulted',
                errorCode: 'ConnectorLockFailure',
                timestamp: new Date().toISOString(),
            } as any);

            expect(connectorsService.updateStatus).toHaveBeenCalledWith(
                1,
                1,
                'Faulted',
            );
        });

        it('should handle missing station gracefully', async () => {
            stationsService.findByOcppIdentifier.mockResolvedValue(null);

            const result = await handler.handle(cpId, {
                connectorId: 1,
                status: 'Available',
                errorCode: 'NoError',
                timestamp: new Date().toISOString(),
            } as any);

            expect(connectorsService.updateStatus).not.toHaveBeenCalled();
            expect(result).toEqual({});
        });
    });
});
