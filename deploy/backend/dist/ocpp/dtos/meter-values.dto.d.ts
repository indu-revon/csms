export interface MeterValuesRequest {
    connectorId: number;
    transactionId?: number;
    meterValue: Array<{
        timestamp: string;
        sampledValue: Array<{
            value: string;
            context?: string;
            format?: string;
            measurand?: string;
            phase?: string;
            location?: string;
            unit?: string;
        }>;
    }>;
}
export interface MeterValuesResponse {
}
