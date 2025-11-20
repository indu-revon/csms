export interface ReserveNowRequest {
    connectorId: number;
    expiryDate: string;
    idTag: string;
    reservationId: number;
    parentIdTag?: string;
}
export interface ReserveNowResponse {
    status: 'Accepted' | 'Faulted' | 'Occupied' | 'Rejected' | 'Unavailable';
}
export interface CancelReservationRequest {
    reservationId: number;
}
export interface CancelReservationResponse {
    status: 'Accepted' | 'Rejected';
}
