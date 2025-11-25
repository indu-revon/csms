module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/src'],
    setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
    testMatch: ['**/*.spec.ts'],
    moduleFileExtensions: ['js', 'json', 'ts'],
    collectCoverageFrom: [
        'src/**/*.ts',
        '!src/**/*.spec.ts',
        '!src/**/*.dto.ts',
        '!src/main.ts',
        '!src/test/**',
        '!src/config/**',
    ],
    coverageDirectory: './coverage',
    coverageThresholds: {
        global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80,
        },
    },
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
    },
    testTimeout: 10000,
    verbose: true,
};
