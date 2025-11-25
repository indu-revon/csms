import { Test, TestingModule } from '@nestjs/testing';
import { AuthorizeHandler } from './authorize.handler';
import { RfidService } from '../../charging/rfid/rfid.service';
import {
    createMockRfidCard,
    createMockBlockedRfidCard,
    createMockExpiredRfidCard,
    createMockNotYetValidRfidCard,
} from '../../test/factories/test-data.factory';

describe('AuthorizeHandler', () => {
    let handler: AuthorizeHandler;
    let rfidService: jest.Mocked<RfidService>;

    beforeEach(async () => {
        const mockRfidService = {
            findByTagId: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthorizeHandler,
                {
                    provide: RfidService,
                    useValue: mockRfidService,
                },
            ],
        }).compile();

        handler = module.get<AuthorizeHandler>(AuthorizeHandler);
        rfidService = module.get(RfidService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('handle', () => {
        const cpId = 'TEST_STATION_001';

        it('should return Accepted for valid active RFID card', async () => {
            const mockCard = createMockRfidCard({
                tagId: 'VALID_RFID_001',
                status: 'Active',
                validFrom: new Date('2024-01-01'),
                validUntil: new Date('2025-12-31'),
                parentIdTag: 'PARENT_TAG_001',
            });

            rfidService.findByTagId.mockResolvedValue(mockCard as any);

            const result = await handler.handle(cpId, { idTag: 'VALID_RFID_001' });

            expect(rfidService.findByTagId).toHaveBeenCalledWith('VALID_RFID_001');
            expect(result).toEqual({
                idTagInfo: {
                    status: 'Accepted',
                    expiryDate: mockCard.validUntil.toISOString(),
                    parentIdTag: 'PARENT_TAG_001',
                },
            });
        });

        it('should return Invalid for non-existent RFID card', async () => {
            rfidService.findByTagId.mockResolvedValue(null);

            const result = await handler.handle(cpId, { idTag: 'UNKNOWN_RFID' });

            expect(rfidService.findByTagId).toHaveBeenCalledWith('UNKNOWN_RFID');
            expect(result).toEqual({
                idTagInfo: {
                    status: 'Invalid',
                },
            });
        });

        it('should return Blocked for blocked RFID card', async () => {
            const mockCard = createMockBlockedRfidCard();
            rfidService.findByTagId.mockResolvedValue(mockCard as any);

            const result = await handler.handle(cpId, { idTag: mockCard.tagId });

            expect(result).toEqual({
                idTagInfo: {
                    status: 'Blocked',
                },
            });
        });

        it('should return Expired for expired RFID card', async () => {
            const mockCard = createMockExpiredRfidCard();
            rfidService.findByTagId.mockResolvedValue(mockCard as any);

            const result = await handler.handle(cpId, { idTag: mockCard.tagId });

            expect(result).toEqual({
                idTagInfo: {
                    status: 'Expired',
                },
            });
        });

        it('should return Invalid for not-yet-valid RFID card', async () => {
            const mockCard = createMockNotYetValidRfidCard();
            rfidService.findByTagId.mockResolvedValue(mockCard as any);

            const result = await handler.handle(cpId, { idTag: mockCard.tagId });

            expect(result).toEqual({
                idTagInfo: {
                    status: 'Invalid',
                },
            });
        });

        it('should return Invalid when RfidService throws error', async () => {
            rfidService.findByTagId.mockRejectedValue(new Error('Database error'));

            const result = await handler.handle(cpId, { idTag: 'ERROR_RFID' });

            expect(result).toEqual({
                idTagInfo: {
                    status: 'Invalid',
                },
            });
        });

        it('should handle RFID card with no expiry date', async () => {
            const mockCard = createMockRfidCard({
                validUntil: null,
            });
            rfidService.findByTagId.mockResolvedValue(mockCard as any);

            const result = await handler.handle(cpId, { idTag: mockCard.tagId });

            expect(result.idTagInfo.status).toBe('Accepted');
            expect(result.idTagInfo.expiryDate).toBeUndefined();
        });

        it('should handle RFID card with no parent tag', async () => {
            const mockCard = createMockRfidCard({
                parentIdTag: null,
            });
            rfidService.findByTagId.mockResolvedValue(mockCard as any);

            const result = await handler.handle(cpId, { idTag: mockCard.tagId });

            expect(result.idTagInfo.status).toBe('Accepted');
            expect(result.idTagInfo.parentIdTag).toBeFalsy(); // null or undefined
        });
    });
});
