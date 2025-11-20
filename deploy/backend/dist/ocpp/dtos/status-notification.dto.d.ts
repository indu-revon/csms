export interface StatusNotificationRequest {
    connectorId: number;
    errorCode: string;
    status: string;
    info?: string;
    timestamp?: string;
    vendorId?: string;
    vendorErrorCode?: string;
}
export interface StatusNotificationResponse {
}
