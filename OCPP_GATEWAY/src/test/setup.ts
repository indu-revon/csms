/**
 * Jest setup file
 * This file runs before all tests to set up the testing environment
 */

// Mock Prisma Client to avoid localStorage errors
jest.mock('@prisma/client', () => ({
    PrismaClient: jest.fn().mockImplementation(() => ({
        $connect: jest.fn(),
        $disconnect: jest.fn(),
        $transaction: jest.fn(),
    })),
}));

// Increase test timeout for slower CI environments
jest.setTimeout(10000);
