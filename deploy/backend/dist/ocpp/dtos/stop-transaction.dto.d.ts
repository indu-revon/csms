export interface StopTransactionRequest {
    transactionId: number;
    timestamp: string;
    meterStop: number;
    idTag?: string;
    reason?: string;
    transactionData?: any[];
}
export interface StopTransactionResponse {
    idTagInfo?: {
        status: 'Accepted' | 'Blocked' | 'Expired' | 'Invalid' | 'ConcurrentTx';
        expiryDate?: string;
        parentIdTag?: string;
    };
}
