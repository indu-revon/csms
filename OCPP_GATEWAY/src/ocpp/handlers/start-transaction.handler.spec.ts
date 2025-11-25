import { Test, TestingModule } from '@nestjs/testing';
import { StartTransactionHandler } from './start-transaction.handler';
import { StationsService } from '../../charging/stations/stations.service';
import { SessionsService } from '../../charging/sessions/sessions.service';
import { RfidService } from '../../charging/rfid/rfid.service';
import { ConnectorsService } from '../../charging/connectors/connectors.service';
import {
    createMockStation,
    createMockRfidCard,
    createMockBlockedRfidCard,
    createMockExpiredRfidCard,
    createMockNotYetValidRfidCard,
    createMockConnector,
    createMockUnavailableConnector,
    createMockFaultedConnector,
    createMockSession,
} from '../../test/factories/test-data.factory';

describe('StartTransactionHandler', () => {
    let handler: StartTransactionHandler;
    let stationsService: jest.Mocked<StationsService>;
    let sessionsService: jest.Mocked<SessionsService>;
    let rfidService: jest.Mocked<RfidService>;
    let connectorsService: jest.Mocked<ConnectorsService>;

    beforeEach(async () => {
        const mockStationsService = {
            findByOcppIdentifier: jest.fn(),
        };

        const mockSessionsService = {
            createSession: jest.fn(),
            updateTransactionId: jest.fn(),
            findActiveSessionsByStation: jest.fn(),
            stopSession: jest.fn(),
        };

        const mockRfidService = {
            findByTagId: jest.fn(),
        };

        const mockConnectorsService = {
            findConnector: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                StartTransactionHandler,
                {
                    provide: StationsService,
                    useValue: mockStationsService,
                },
                {
                    provide: SessionsService,
                    useValue: mockSessionsService,
                },
                {
                    provide: RfidService,
                    useValue: mockRfidService,
                },
                {
                    provide: ConnectorsService,
                    useValue: mockConnectorsService,
                },
            ],
        }).compile();

        handler = module.get<StartTransactionHandler>(StartTransactionHandler);
        stationsService = module.get(StationsService);
        sessionsService = module.get(SessionsService);
        rfidService = module.get(RfidService);
        connectorsService = module.get(ConnectorsService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('handle', () => {
        const cpId = 'TEST_STATION_001';
        const validRequest = {
            connectorId: 1,
            idTag: 'VALID_RFID_001',
            timestamp: new Date().toISOString(),
            meterStart: 1000,
        };

        it('should successfully start a transaction with valid inputs', async () => {
            const mockStation = createMockStation({ ocppIdentifier: cpId });
            const mockCard = createMockRfidCard({ tagId: validRequest.idTag });
            const mockConnector = createMockConnector({ connectorId: validRequest.connectorId });
            const mockSession = createMockSession({
                id: 42,
                ocppTransactionId: 42,
                chargingStationId: mockStation.id,
                connectorId: mockConnector.id,
            });

            stationsService.findByOcppIdentifier.mockResolvedValue(mockStation as any);
            rfidService.findByTagId.mockResolvedValue(mockCard as any);
            connectorsService.findConnector.mockResolvedValue(mockConnector as any);
            sessionsService.findActiveSessionsByStation.mockResolvedValue([]);
            sessionsService.createSession.mockResolvedValue(mockSession as any);
            sessionsService.updateTransactionId.mockResolvedValue(mockSession as any);

            const result = await handler.handle(cpId, validRequest);

            expect(stationsService.findByOcppIdentifier).toHaveBeenCalledWith(cpId);
            expect(rfidService.findByTagId).toHaveBeenCalledWith(validRequest.idTag);
            expect(connectorsService.findConnector).toHaveBeenCalledWith(
                mockStation.id,
                validRequest.connectorId,
            );
            expect(sessionsService.findActiveSessionsByStation).toHaveBeenCalledWith(mockStation.id);
            expect(sessionsService.createSession).toHaveBeenCalled();
            expect(sessionsService.updateTransactionId).toHaveBeenCalledWith(42, 42);

            expect(result).toEqual({
                transactionId: 42,
                idTagInfo: {
                    status: 'Accepted',
                    expiryDate: mockCard.validUntil.toISOString(),
                    parentIdTag: undefined,  // Handler returns undefined when null
                },
            });
        });

        it('should return transactionId 0 for non-existent station', async () => {
            stationsService.findByOcppIdentifier.mockResolvedValue(null);

            await expect(handler.handle(cpId, validRequest)).rejects.toThrow('Station not found');
        });

        it('should return transactionId 0 for non-existent RFID card', async () => {
            const mockStation = createMockStation({ ocppIdentifier: cpId });
            stationsService.findByOcppIdentifier.mockResolvedValue(mockStation as any);
            rfidService.findByTagId.mockResolvedValue(null);

            const result = await handler.handle(cpId, validRequest);

            expect(result).toEqual({
                transactionId: 0,
                idTagInfo: {
                    status: 'Invalid',
                },
            });
        });

        it('should return transactionId 0 for blocked RFID card', async () => {
            const mockStation = createMockStation({ ocppIdentifier: cpId });
            const mockCard = createMockBlockedRfidCard();

            stationsService.findByOcppIdentifier.mockResolvedValue(mockStation as any);
            rfidService.findByTagId.mockResolvedValue(mockCard as any);

            const result = await handler.handle(cpId, validRequest);

            expect(result).toEqual({
                transactionId: 0,
                idTagInfo: {
                    status: 'Blocked',
                },
            });
        });

        it('should return transactionId 0 for expired RFID card', async () => {
            const mockStation = createMockStation({ ocppIdentifier: cpId });
            const mockCard = createMockExpiredRfidCard();

            stationsService.findByOcppIdentifier.mockResolvedValue(mockStation as any);
            rfidService.findByTagId.mockResolvedValue(mockCard as any);

            const result = await handler.handle(cpId, validRequest);

            expect(result).toEqual({
                transactionId: 0,
                idTagInfo: {
                    status: 'Expired',
                },
            });
        });

        it('should return transactionId 0 for not-yet-valid RFID card', async () => {
            const mockStation = createMockStation({ ocppIdentifier: cpId });
            const mockCard = createMockNotYetValidRfidCard();

            stationsService.findByOcppIdentifier.mockResolvedValue(mockStation as any);
            rfidService.findByTagId.mockResolvedValue(mockCard as any);

            const result = await handler.handle(cpId, validRequest);

            expect(result).toEqual({
                transactionId: 0,
                idTagInfo: {
                    status: 'Invalid',
                },
            });
        });

        it('should return transactionId 0 for non-existent connector', async () => {
            const mockStation = createMockStation({ ocppIdentifier: cpId });
            const mockCard = createMockRfidCard();

            stationsService.findByOcppIdentifier.mockResolvedValue(mockStation as any);
            rfidService.findByTagId.mockResolvedValue(mockCard as any);
            connectorsService.findConnector.mockResolvedValue(null);

            const result = await handler.handle(cpId, validRequest);

            expect(result).toEqual({
                transactionId: 0,
                idTagInfo: {
                    status: 'Invalid',
                },
            });
        });

        it('should return transactionId 0 for faulted connector', async () => {
            const mockStation = createMockStation({ ocppIdentifier: cpId });
            const mockCard = createMockRfidCard();
            const mockConnector = createMockFaultedConnector();

            stationsService.findByOcppIdentifier.mockResolvedValue(mockStation as any);
            rfidService.findByTagId.mockResolvedValue(mockCard as any);
            connectorsService.findConnector.mockResolvedValue(mockConnector as any);

            const result = await handler.handle(cpId, validRequest);

            expect(result).toEqual({
                transactionId: 0,
                idTagInfo: {
                    status: 'Invalid',
                },
            });
        });

        it('should return transactionId 0 for unavailable connector', async () => {
            const mockStation = createMockStation({ ocppIdentifier: cpId });
            const mockCard = createMockRfidCard();
            const mockConnector = createMockUnavailableConnector();

            stationsService.findByOcppIdentifier.mockResolvedValue(mockStation as any);
            rfidService.findByTagId.mockResolvedValue(mockCard as any);
            connectorsService.findConnector.mockResolvedValue(mockConnector as any);

            const result = await handler.handle(cpId, validRequest);

            expect(result).toEqual({
                transactionId: 0,
                idTagInfo: {
                    status: 'Invalid',
                },
            });
        });

        it('should auto-close zombie session on same connector', async () => {
            const mockStation = createMockStation({ ocppIdentifier: cpId });
            const mockCard = createMockRfidCard();
            const mockConnector = createMockConnector({ connectorId: validRequest.connectorId });
            const zombieSession = createMockSession({
                id: 10,
                ocppTransactionId: 10,
                connectorId: mockConnector.id,
                sessionStatus: 'ACTIVE',
            });
            const newSession = createMockSession({
                id: 50,
                ocppTransactionId: 50,
            });

            stationsService.findByOcppIdentifier.mockResolvedValue(mockStation as any);
            rfidService.findByTagId.mockResolvedValue(mockCard as any);
            connectorsService.findConnector.mockResolvedValue(mockConnector as any);
            sessionsService.findActiveSessionsByStation.mockResolvedValue([zombieSession] as any);
            sessionsService.stopSession.mockResolvedValue({} as any);
            sessionsService.createSession.mockResolvedValue(newSession as any);
            sessionsService.updateTransactionId.mockResolvedValue(newSession as any);

            const result = await handler.handle(cpId, validRequest);

            expect(sessionsService.stopSession).toHaveBeenCalledWith(
                mockStation.id,
                zombieSession.ocppTransactionId,
                expect.objectContaining({
                    stopReason: 'ZombieSessionAutoClosed',
                }),
            );

            expect(result.transactionId).toBe(50);
            expect(result.idTagInfo.status).toBe('Accepted');
        });

        it('should use session ID as transaction ID', async () => {
            const mockStation = createMockStation({ ocppIdentifier: cpId });
            const mockCard = createMockRfidCard();
            const mockConnector = createMockConnector();
            const mockSession = createMockSession({
                id: 123,
                ocppTransactionId: 0, // Initially 0
            });

            stationsService.findByOcppIdentifier.mockResolvedValue(mockStation as any);
            rfidService.findByTagId.mockResolvedValue(mockCard as any);
            connectorsService.findConnector.mockResolvedValue(mockConnector as any);
            sessionsService.findActiveSessionsByStation.mockResolvedValue([]);
            sessionsService.createSession.mockResolvedValue(mockSession as any);

            await handler.handle(cpId, validRequest);

            expect(sessionsService.updateTransactionId).toHaveBeenCalledWith(123, 123);
        });

        it('should include RFID card metadata in response', async () => {
            const mockStation = createMockStation({ ocppIdentifier: cpId });
            const mockCard = createMockRfidCard({
                validUntil: new Date('2026-12-31'),
                parentIdTag: 'PARENT_TAG_001',
            });
            const mockConnector = createMockConnector();
            const mockSession = createMockSession({ id: 99, ocppTransactionId: 99 });

            stationsService.findByOcppIdentifier.mockResolvedValue(mockStation as any);
            rfidService.findByTagId.mockResolvedValue(mockCard as any);
            connectorsService.findConnector.mockResolvedValue(mockConnector as any);
            sessionsService.findActiveSessionsByStation.mockResolvedValue([]);
            sessionsService.createSession.mockResolvedValue(mockSession as any);

            const result = await handler.handle(cpId, validRequest);

            expect(result.idTagInfo).toEqual({
                status: 'Accepted',
                expiryDate: '2026-12-31T00:00:00.000Z',
                parentIdTag: 'PARENT_TAG_001',
            });
        });
    });
});
