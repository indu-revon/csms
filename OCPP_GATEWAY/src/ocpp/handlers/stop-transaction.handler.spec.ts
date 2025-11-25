import { Test, TestingModule } from '@nestjs/testing';
import { StopTransactionHandler } from './stop-transaction.handler';
import { SessionsService } from '../../charging/sessions/sessions.service';
import { StationsService } from '../../charging/stations/stations.service';
import { createMockSession, createMockStation } from '../../test/factories/test-data.factory';

describe('StopTransactionHandler', () => {
    let handler: StopTransactionHandler;
    let sessionsService: jest.Mocked<SessionsService>;
    let stationsService: jest.Mocked<StationsService>;

    beforeEach(async () => {
        const mockSessionsService = {
            findActiveSession: jest.fn(),
            stopSession: jest.fn(),
            addMeterValue: jest.fn(),
        };

        const mockStationsService = {
            findByOcppIdentifier: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                StopTransactionHandler,
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

        handler = module.get<StopTransactionHandler>(StopTransactionHandler);
        sessionsService = module.get(SessionsService);
        stationsService = module.get(StationsService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('handle', () => {
        const cpId = 'TEST_STATION_001';
        const validRequest = {
            transactionId: 42,
            idTag: 'VALID_RFID_001',
            timestamp: new Date().toISOString(),
            meterStop: 1500,
            reason: 'Local',
        };

        it('should successfully stop a transaction', async () => {
            const mockStation = createMockStation({ id: 1 });
            stationsService.findByOcppIdentifier.mockResolvedValue(mockStation as any);

            const mockSession = createMockSession({
                id: 42,
                ocppTransactionId: 42,
                chargingStationId: 1,
                startMeterValue: 1000,
            });

            sessionsService.findActiveSession.mockResolvedValue(mockSession as any);
            sessionsService.stopSession.mockResolvedValue({
                ...mockSession,
                sessionStatus: 'COMPLETED',
                stopMeterValue: validRequest.meterStop,
            } as any);

            const result = await handler.handle(cpId, validRequest);

            expect(sessionsService.findActiveSession).toHaveBeenCalledWith(1, 42);
            expect(sessionsService.stopSession).toHaveBeenCalledWith(
                1,
                42,
                expect.objectContaining({
                    stopTimestamp: expect.any(Date),
                    stopMeterValue: 1500,
                    stopReason: 'Local',
                }),
            );

            expect(result).toEqual({
                idTagInfo: {
                    status: 'Accepted',
                },
            });
        });

        it('should calculate energy consumption correctly', async () => {
            const mockStation = createMockStation({ id: 1 });
            stationsService.findByOcppIdentifier.mockResolvedValue(mockStation as any);

            const mockSession = createMockSession({
                chargingStationId: 1,
                startMeterValue: 1000,
            });

            sessionsService.findActiveSession.mockResolvedValue(mockSession as any);
            sessionsService.stopSession.mockResolvedValue({} as any);

            await handler.handle(cpId, {
                ...validRequest,
                meterStop: 1500,
            });

            expect(sessionsService.stopSession).toHaveBeenCalledWith(
                1,
                validRequest.transactionId,
                expect.objectContaining({
                    stopMeterValue: 1500,
                    energyKwh: 0.5, // (1500 - 1000) / 1000 = 0.5 kWh
                }),
            );
        });

        it('should handle transaction data with transaction meters', async () => {
            const mockStation = createMockStation({ id: 1 });
            stationsService.findByOcppIdentifier.mockResolvedValue(mockStation as any);

            const mockSession = createMockSession({
                chargingStationId: 1,
                startMeterValue: 2000,
            });

            const transactionData = [
                {
                    timestamp: new Date().toISOString(),
                    sampledValue: [
                        {
                            value: '2250',
                            measurand: 'Energy.Active.Import.Register',
                            unit: 'Wh',
                        },
                    ],
                },
            ];

            sessionsService.findActiveSession.mockResolvedValue(mockSession as any);
            sessionsService.stopSession.mockResolvedValue({} as any);

            await handler.handle(cpId, {
                ...validRequest,
                meterStop: 3000,
                transactionData,
            });

            expect(sessionsService.stopSession).toHaveBeenCalledWith(
                1,
                validRequest.transactionId,
                expect.objectContaining({
                    stopMeterValue: 3000,
                    energyKwh: 1.0, // (3000 - 2000) / 1000
                }),
            );
        });

        it('should return Accepted for non-existent session (idempotency)', async () => {
            const mockStation = createMockStation({ id: 1 });
            stationsService.findByOcppIdentifier.mockResolvedValue(mockStation as any);
            sessionsService.findActiveSession.mockResolvedValue(null);

            const result = await handler.handle(cpId, validRequest);

            expect(sessionsService.stopSession).not.toHaveBeenCalled();
            expect(result).toEqual({
                idTagInfo: {
                    status: 'Accepted',
                },
            });
        });

        it('should handle different stop reasons', async () => {
            const mockStation = createMockStation({ id: 1 });
            stationsService.findByOcppIdentifier.mockResolvedValue(mockStation as any);

            const mockSession = createMockSession({ chargingStationId: 1 });
            sessionsService.findActiveSession.mockResolvedValue(mockSession as any);
            sessionsService.stopSession.mockResolvedValue({} as any);

            const reasons = ['EVDisconnected', 'Remote', 'EmergencyStop', 'Other'];

            for (const reason of reasons) {
                await handler.handle(cpId, { ...validRequest, reason });

                expect(sessionsService.stopSession).toHaveBeenCalledWith(
                    expect.any(Number),
                    expect.any(Number),
                    expect.objectContaining({
                        stopReason: reason,
                    }),
                );

                jest.clearAllMocks();
                stationsService.findByOcppIdentifier.mockResolvedValue(mockStation as any);
                sessionsService.findActiveSession.mockResolvedValue(mockSession as any);
                sessionsService.stopSession.mockResolvedValue({} as any);
            }
        });

        it('should handle missing optional fields', async () => {
            const mockStation = createMockStation({ id: 1 });
            stationsService.findByOcppIdentifier.mockResolvedValue(mockStation as any);

            const mockSession = createMockSession({ chargingStationId: 1 });
            sessionsService.findActiveSession.mockResolvedValue(mockSession as any);
            sessionsService.stopSession.mockResolvedValue({} as any);

            const minimalRequest = {
                transactionId: 42,
                idTag: 'VALID_RFID_001',
                timestamp: new Date().toISOString(),
                meterStop: 1500,
            };

            const result = await handler.handle(cpId, minimalRequest);

            expect(result.idTagInfo.status).toBe('Accepted');
        });

        it('should return Accepted on error (graceful degradation)', async () => {
            stationsService.findByOcppIdentifier.mockRejectedValue(new Error('Database error'));

            const result = await handler.handle(cpId, validRequest);

            expect(result).toEqual({
                idTagInfo: {
                    status: 'Accepted',
                },
            });
        });
    });
});
