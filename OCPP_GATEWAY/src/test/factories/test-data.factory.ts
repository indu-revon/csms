/**
 * Factory functions for creating test data
 * These provide consistent mock data for unit tests
 */

export const createMockStation = (overrides: Partial<any> = {}) => {
    return {
        id: 1,
        ocppIdentifier: 'TEST_STATION_001',
        name: 'Test Charging Station',
        location: 'Test Location',
        vendor: 'TestVendor',
        model: 'TestModel',
        firmwareVersion: '1.0.0',
        status: 'Online',
        lastHeartbeat: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        ...overrides,
    };
};

export const createMockRfidCard = (overrides: Partial<any> = {}) => {
    return {
        id: 1,
        tagId: 'TEST_RFID_001',
        status: 'Active',
        userName: 'Test User',
        validFrom: new Date('2024-01-01'),
        validUntil: new Date('2025-12-31'),
        parentIdTag: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...overrides,
    };
};

export const createMockBlockedRfidCard = (overrides: Partial<any> = {}) => {
    return createMockRfidCard({
        tagId: 'BLOCKED_RFID_001',
        status: 'Blocked',
        ...overrides,
    });
};

export const createMockExpiredRfidCard = (overrides: Partial<any> = {}) => {
    return createMockRfidCard({
        tagId: 'EXPIRED_RFID_001',
        status: 'Active',
        validUntil: new Date('2020-01-01'), // Expired date
        ...overrides,
    });
};

export const createMockNotYetValidRfidCard = (overrides: Partial<any> = {}) => {
    return createMockRfidCard({
        tagId: 'FUTURE_RFID_001',
        status: 'Active',
        validFrom: new Date('2030-01-01'), // Future date
        ...overrides,
    });
};

export const createMockConnector = (overrides: Partial<any> = {}) => {
    return {
        id: 1,
        chargingStationId: 1,
        connectorId: 1,
        type: 'Type2',
        status: 'Available',
        errorCode: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...overrides,
    };
};

export const createMockUnavailableConnector = (overrides: Partial<any> = {}) => {
    return createMockConnector({
        connectorId: 2,
        status: 'Unavailable',
        ...overrides,
    });
};

export const createMockFaultedConnector = (overrides: Partial<any> = {}) => {
    return createMockConnector({
        connectorId: 3,
        status: 'Faulted',
        errorCode: 'ConnectorLockFailure',
        ...overrides,
    });
};

export const createMockSession = (overrides: Partial<any> = {}) => {
    return {
        id: 1,
        chargingStationId: 1,
        connectorId: 1,
        ocppTransactionId: 1,
        ocppIdTag: 'TEST_RFID_001',
        startTimestamp: new Date(),
        startMeterValue: 1000,
        stopTimestamp: null,
        stopMeterValue: null,
        stopReason: null,
        energyKwh: null,
        sessionStatus: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
        ...overrides,
    };
};

export const createMockCompletedSession = (overrides: Partial<any> = {}) => {
    const startMeter = 1000;
    const stopMeter = 1500;
    return createMockSession({
        stopTimestamp: new Date(),
        stopMeterValue: stopMeter,
        stopReason: 'Local',
        energyKwh: (stopMeter - startMeter) / 1000,
        sessionStatus: 'COMPLETED',
        ...overrides,
    });
};

export const createMockMeterValue = (overrides: Partial<any> = {}) => {
    return {
        id: 1,
        chargingSessionId: 1,
        timestamp: new Date(),
        meterValue: 1250,
        rawJson: null,
        createdAt: new Date(),
        ...overrides,
    };
};

/**
 * Create multiple mock objects for testing pagination and lists
 */
export const createMockStations = (count: number) => {
    return Array.from({ length: count }, (_, i) =>
        createMockStation({
            id: i + 1,
            ocppIdentifier: `TEST_STATION_${String(i + 1).padStart(3, '0')}`,
            name: `Test Station ${i + 1}`,
        })
    );
};

export const createMockSessions = (count: number) => {
    return Array.from({ length: count }, (_, i) =>
        createMockSession({
            id: i + 1,
            ocppTransactionId: i + 1,
        })
    );
};
