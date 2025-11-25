import { Injectable, Logger } from '@nestjs/common';
import { VendorHandler } from './vendor-handler.interface';
import { DataTransferRequest, DataTransferResponse } from '../dtos/data-transfer.dto';

/**
 * ABB vendor-specific DataTransfer handler
 * Handles ABB proprietary messages
 */
@Injectable()
export class ABBVendorHandler implements VendorHandler {
    private readonly logger = new Logger(ABBVendorHandler.name);
    readonly vendorId = 'ABB';

    async handle(cpId: string, payload: DataTransferRequest): Promise<DataTransferResponse> {
        this.logger.log(
            `[${cpId}] ABB DataTransfer: messageId=${payload.messageId || 'N/A'}`
        );

        // Example: Handle ABB-specific message IDs
        switch (payload.messageId) {
            case 'DiagnosticsLog':
                return this.handleDiagnostics(cpId, payload);

            case 'FirmwareStatus':
                return this.handleFirmwareStatus(cpId, payload);

            default:
                this.logger.debug(`[${cpId}] Unknown ABB message: ${payload.messageId}`);
                return { status: 'UnknownMessageId' };
        }
    }

    private async handleDiagnostics(cpId: string, payload: DataTransferRequest): Promise<DataTransferResponse> {
        this.logger.log(`[${cpId}] ABB Diagnostics received`);
        // Store diagnostics data, trigger alerts, etc.
        return {
            status: 'Accepted',
            data: 'Diagnostics logged',
        };
    }

    private async handleFirmwareStatus(cpId: string, payload: DataTransferRequest): Promise<DataTransferResponse> {
        this.logger.log(`[${cpId}] ABB Firmware status: ${JSON.stringify(payload.data)}`);
        // Update firmware status in database
        return {
            status: 'Accepted',
        };
    }
}
