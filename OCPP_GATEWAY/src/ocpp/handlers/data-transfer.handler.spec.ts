import { Test, TestingModule } from '@nestjs/testing';
import { DataTransferHandler } from './data-transfer.handler';

describe('DataTransferHandler', () => {
    let handler: DataTransferHandler;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [DataTransferHandler],
        }).compile();

        handler = module.get<DataTransferHandler>(DataTransferHandler);
    });

    describe('handle', () => {
        const cpId = 'TEST_STATION_001';

        it('should return Accepted for unknown vendor (uses GenericVendorHandler)', async () => {
            const request = {
                vendorId: 'UnknownVendor',
                messageId: 'TestMessage',
                data: '{}',
            };

            const result = await handler.handle(cpId, request);

            expect(result.status).toBe('Accepted');
        });

        it('should return UnknownMessageId for ABB vendor with unknown message', async () => {
            const request = {
                vendorId: 'ABB',
                messageId: 'TestMessage',
                data: JSON.stringify({ test: 'data' }),
            };

            const result = await handler.handle(cpId, request);

            expect(result.status).toBe('UnknownMessageId');
        });

        it('should return Accepted for Generic vendor', async () => {
            const request = {
                vendorId: 'Generic',
                messageId: 'TestMessage',
            };

            const result = await handler.handle(cpId, request);

            expect(result.status).toBe('Accepted');
        });

        it('should handle data transfer without data field', async () => {
            const request = {
                vendorId: 'Generic',  // Use Generic instead of ABB
                messageId: 'Heartbeat',
            };

            const result = await handler.handle(cpId, request);

            expect(result.status).toBe('Accepted');
        });

        it('should handle data transfer without messageId', async () => {
            const request = {
                vendorId: 'Generic',
                data: '{"status": "ok"}',
            };

            const result = await handler.handle(cpId, request as any);

            expect(result.status).toBe('Accepted');
        });
    });
});
