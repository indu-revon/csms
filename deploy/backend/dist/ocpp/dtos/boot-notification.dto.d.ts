export interface BootNotificationRequest {
    chargePointVendor: string;
    chargePointModel: string;
    chargePointSerialNumber?: string;
    chargeBoxSerialNumber?: string;
    firmwareVersion?: string;
    iccid?: string;
    imsi?: string;
    meterType?: string;
    meterSerialNumber?: string;
}
export interface BootNotificationResponse {
    status: 'Accepted' | 'Pending' | 'Rejected';
    currentTime: string;
    interval: number;
}
