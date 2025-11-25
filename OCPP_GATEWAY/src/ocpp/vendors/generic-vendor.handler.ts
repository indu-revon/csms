import { Injectable, Logger } from '@nestjs/common';
import { VendorHandler } from './vendor-handler.interface';
import { DataTransferRequest, DataTransferResponse } from '../dtos/data-transfer.dto';

/**
 * Generic fallback handler for unknown vendors or unhandled messages
 */
@Injectable()
export class GenericVendorHandler implements VendorHandler {
    private readonly logger = new Logger(GenericVendorHandler.name);
    readonly vendorId = '*'; // Wildcard for all vendors

    async handle(cpId: string, payload: DataTransferRequest): Promise<DataTransferResponse> {
        this.logger.debug(
            `[${cpId}] Generic DataTransfer: vendorId=${payload.vendorId}, ` +
            `messageId=${payload.messageId || 'N/A'}`
        );

        // Log the data if present
        if (payload.data) {
            this.logger.debug(`[${cpId}] DataTransfer data: ${JSON.stringify(payload.data)}`);
        }

        // Generic handler accepts all but doesn't process
        return {
            status: 'Accepted',
        };
    }
}
