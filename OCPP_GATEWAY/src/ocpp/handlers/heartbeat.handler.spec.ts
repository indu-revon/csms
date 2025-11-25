import { Test, TestingModule } from '@nestjs/testing';
import { HeartbeatHandler } from './heartbeat.handler';
import { StationsService } from '../../charging/stations/stations.service';
import { createMockStation } from '../../test/factories/test-data.factory';

describe('HeartbeatHandler', () => {
    let handler: HeartbeatHandler;
    let stationsService: jest.Mocked<StationsService>;

    beforeEach(async () => {
        const mockStationsService = {
            updateHeartbeat: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                HeartbeatHandler,
                {
                    provide: StationsService,
                    useValue: mockStationsService,
                },
            ],
        }).compile();

        handler = module.get<HeartbeatHandler>(HeartbeatHandler);
        stationsService = module.get(StationsService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('handle', () => {
        const cpId = 'TEST_STATION_001';

        it('should update last heartbeat timestamp and return current time', async () => {
            stationsService.updateHeartbeat.mockResolvedValue({} as any);

            const beforeTime = new Date();
            const result = await handler.handle(cpId, {});
            const afterTime = new Date();

            expect(stationsService.updateHeartbeat).toHaveBeenCalledWith(cpId);

            const resultTime = new Date(result.currentTime);
            expect(resultTime.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
            expect(resultTime.getTime()).toBeLessThanOrEqual(afterTime.getTime());
        });

        it('should return current time ISO format', async () => {
            stationsService.updateHeartbeat.mockResolvedValue({} as any);

            const result = await handler.handle(cpId, {});

            expect(result.currentTime).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
            expect(() => new Date(result.currentTime)).not.toThrow();
        });

        it('should handle station update errors gracefully', async () => {
            stationsService.updateHeartbeat.mockRejectedValue(new Error('Database error'));

            const result = await handler.handle(cpId, {});

            expect(result.currentTime).toBeDefined();
        });
    });
});
