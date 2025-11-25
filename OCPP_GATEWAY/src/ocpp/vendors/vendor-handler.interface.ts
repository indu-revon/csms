import { DataTransferRequest, DataTransferResponse } from '../dtos/data-transfer.dto';

/**
 * Interface for vendor-specific DataTransfer handlers
 * Each vendor can implement custom logic for their proprietary messages
 */
export interface VendorHandler {
    /**
     * Vendor ID this handler is responsible for (e.g., 'ABB', 'Schneider', 'EVBox')
     */
    readonly vendorId: string;

    /**
     * Handle a DataTransfer message from this vendor
     * @param cpId - Charge point identifier
     * @param payload - DataTransfer request payload
     * @returns DataTransfer response with appropriate status
     */
    handle(cpId: string, payload: DataTransferRequest): Promise<DataTransferResponse>;
}
