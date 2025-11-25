import { Test, TestingModule } from '@nestjs/testing';
import { MeterValuesHandler } from './meter-values.handler';
import { SessionsService } from '../../charging/sessions/sessions.service';
import { StationsService } from '../../charging/stations/stations.service';
import { createMockStation, createMockSession } from '../../test/factories/test-data.factory';

describe('MeterValuesHandler', () => {
    let handler: MeterValuesHandler;
    let sessionsService: jest.Mocked<SessionsService>;
    let stationsService: jest.Mocked<StationsService>;

    beforeEach(async () => {
        const mockSessionsService = {
            findActiveSession: jest.fn(),
            addMeterValue: jest.fn(),
        };

        const mockStationsService = {
            findByOcppIdentifier: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MeterValuesHandler,
                {
                    provide: SessionsService,
                    useValue: mockSessionsService,
                },
                {
                    provide: StationsService,
                    useValue: mockStationsService,
                },
            ],
        }).compile();

        handler = module.get<MeterValuesHandler>(MeterValuesHandler);
        sessionsService = module.get(SessionsService);
        stationsService = module.get(StationsService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('handle', () => {
        const cpId = 'TEST_STATION_001';

        it('should store meter values for active session', async () => {
            const mockStation = createMockStation({ id: 1, ocppIdentifier: cpId });
            const mockSession = createMockSession({ id: 42 });

            stationsService.findByOcppIdentifier.mockResolvedValue(mockStation as any);
            sessionsService.findActiveSession.mockResolvedValue(mockSession as any);
            sessionsService.addMeterValue.mockResolvedValue({} as any);

            const request = {
                connectorId: 1,
                transactionId: 42,
                meterValue: [
                    {
                        timestamp: new Date().toISOString(),
                        sampledValue: [
                            {
                                value: '1500',
                                measurand: 'Energy.Active.Import.Register',
                                unit: 'Wh',
                            },
                        ],
                    },
                ],
            };

            const result = await handler.handle(cpId, request);

            expect(sessionsService.addMeterValue).toHaveBeenCalled();
            expect(result).toEqual({});
        });

        it('should handle multiple measurands', async () => {
            const mockStation = createMockStation({ id: 1 });
            const mockSession = createMockSession({ id: 42 });

            stationsService.findByOcppIdentifier.mockResolvedValue(mockStation as any);
            sessionsService.findActiveSession.mockResolvedValue(mockSession as any);

            const request = {
                connectorId: 1,
                transactionId: 42,
                meterValue: [
                    {
                        timestamp: new Date().toISOString(),
                        sampledValue: [
                            { value: '1500', measurand: 'Energy.Active.Import.Register', unit: 'Wh' },
                            { value: '7.5', measurand: 'Power.Active.Import', unit: 'kW' },
                            { value: '230', measurand: 'Voltage', unit: 'V' },
                            { value: '32.6', measurand: 'Current.Import', unit: 'A' },
                        ],
                    },
                ],
            };

            await handler.handle(cpId, request);

            expect(sessionsService.addMeterValue).toHaveBeenCalled();
        });

        it('should handle meter values without active session', async () => {
            const mockStation = createMockStation({ id: 1 });
            stationsService.findByOcppIdentifier.mockResolvedValue(mockStation as any);
            sessionsService.findActiveSession.mockResolvedValue(null);

            const request = {
                connectorId: 1,
                meterValue: [
                    {
                        timestamp: new Date().toISOString(),
                        sampledValue: [{ value: '1500' }],
                    },
                ],
            };

            const result = await handler.handle(cpId, request);

            expect(sessionsService.addMeterValue).not.toHaveBeenCalled();
            expect(result).toEqual({});
        });

        it('should handle missing station gracefully', async () => {
            stationsService.findByOcppIdentifier.mockResolvedValue(null);

            const result = await handler.handle(cpId, {
                connectorId: 1,
                meterValue: [],
            });

            expect(result).toEqual({});
        });
    });
});
