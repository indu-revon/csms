import { PrismaService } from '../../config/database.config';

/**
 * Creates a mock PrismaService for unit testing
 * This avoids actual database calls during tests
 */
export const createMockPrismaService = (): jest.Mocked<PrismaService> => {
    return {
        chargingStation: {
            findUnique: jest.fn(),
            findMany: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
        },
        rfidCard: {
            findUnique: jest.fn(),
            findMany: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
        },
        chargingSession: {
            findUnique: jest.fn(),
            findMany: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
        },
        connector: {
            findUnique: jest.fn(),
            findMany: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
        },
        meterValue: {
            findUnique: jest.fn(),
            findMany: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
        },
        ocppLog: {
            findUnique: jest.fn(),
            findMany: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
        },
        reservation: {
            findUnique: jest.fn(),
            findMany: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
        },
        auditLog: {
            findUnique: jest.fn(),
            findMany: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
        },
        $connect: jest.fn(),
        $disconnect: jest.fn(),
        $transaction: jest.fn(),
    } as any;
};

/**
 * Reset all mocks in the Prisma service
 */
export const resetPrismaMocks = (prisma: jest.Mocked<PrismaService>) => {
    Object.values(prisma).forEach((model: any) => {
        if (model && typeof model === 'object') {
            Object.values(model).forEach((method: any) => {
                if (jest.isMockFunction(method)) {
                    method.mockReset();
                }
            });
        }
    });
};
