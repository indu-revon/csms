import { Injectable, Logger } from '@nestjs/common';
import { DataTransferRequest, DataTransferResponse } from '../dtos/data-transfer.dto';
import { VendorHandler } from '../vendors/vendor-handler.interface';
import { GenericVendorHandler } from '../vendors/generic-vendor.handler';
import { ABBVendorHandler } from '../vendors/abb-vendor.handler';

@Injectable()
export class DataTransferHandler {
  private readonly logger = new Logger(DataTransferHandler.name);
  private readonly vendorHandlers: Map<string, VendorHandler>;
  private readonly genericHandler: VendorHandler;

  constructor() {
    // Initialize vendor-specific handlers
    this.vendorHandlers = new Map<string, VendorHandler>();

    // Register known vendor handlers
    this.registerVendorHandler(new ABBVendorHandler());
    // Add more vendor handlers here:
    // this.registerVendorHandler(new SchneiderVendorHandler());
    // this.registerVendorHandler(new EVBoxVendorHandler());

    // Fallback handler for unknown vendors
    this.genericHandler = new GenericVendorHandler();
  }

  /**
   * Register a vendor-specific handler
   */
  private registerVendorHandler(handler: VendorHandler): void {
    this.vendorHandlers.set(handler.vendorId, handler);
    this.logger.log(`Registered vendor handler: ${handler.vendorId}`);
  }

  async handle(cpId: string, payload: DataTransferRequest): Promise<DataTransferResponse> {
    try {
      this.logger.log(
        `[${cpId}] DataTransfer: vendorId=${payload.vendorId}, ` +
        `messageId=${payload.messageId || 'N/A'}`
      );

      // Check if vendorId is provided
      if (!payload.vendorId) {
        this.logger.warn(`[${cpId}] DataTransfer missing vendorId`);
        return {
          status: 'Rejected',
        };
      }

      // Route to vendor-specific handler or use generic handler
      const handler = this.vendorHandlers.get(payload.vendorId) || this.genericHandler;

      // If using generic handler for an unknown vendor, log it
      if (handler === this.genericHandler && payload.vendorId !== '*') {
        this.logger.debug(`[${cpId}] Unknown vendorId: ${payload.vendorId}, using generic handler`);
      }

      // Delegate to vendor handler
      return await handler.handle(cpId, payload);

    } catch (error) {
      this.logger.error(`[${cpId}] DataTransfer error: ${error.message}`, error.stack);
      return {
        status: 'Rejected',
      };
    }
  }
}
