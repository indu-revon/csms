export interface AuthorizeRequest {
    idTag: string;
}
export interface AuthorizeResponse {
    idTagInfo: {
        status: 'Accepted' | 'Blocked' | 'Expired' | 'Invalid' | 'ConcurrentTx';
        expiryDate?: string;
        parentIdTag?: string;
    };
}
