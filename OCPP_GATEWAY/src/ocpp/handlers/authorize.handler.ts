import { Injectable, Logger } from '@nestjs/common';
import { RfidService } from '../../charging/rfid/rfid.service';
import { AuthorizeRequest, AuthorizeResponse } from '../dtos/authorize.dto';

@Injectable()
export class AuthorizeHandler {
  private readonly logger = new Logger(AuthorizeHandler.name);

  constructor(private readonly rfidService: RfidService) { }

  async handle(cpId: string, payload: AuthorizeRequest): Promise<AuthorizeResponse> {
    try {
      const card = await this.rfidService.findByTagId(payload.idTag);

      // Card not found
      if (!card) {
        this.logger.warn(`[${cpId}] Authorization failed: Card not found - ${payload.idTag}`);
        return {
          idTagInfo: { status: 'Invalid' },
        };
      }

      // Check if card is blocked/inactive
      if (card.status !== 'Active') {
        this.logger.warn(`[${cpId}] Authorization failed: Card ${payload.idTag} status is ${card.status}`);
        return {
          idTagInfo: { status: 'Blocked' },
        };
      }

      // Check if card has expired
      if (card.validUntil && new Date(card.validUntil) < new Date()) {
        this.logger.warn(`[${cpId}] Authorization failed: Card ${payload.idTag} expired on ${card.validUntil}`);
        return {
          idTagInfo: { status: 'Expired' },
        };
      }

      // Check if card is not yet valid
      if (card.validFrom && new Date(card.validFrom) > new Date()) {
        this.logger.warn(`[${cpId}] Authorization failed: Card ${payload.idTag} not valid until ${card.validFrom}`);
        return {
          idTagInfo: { status: 'Invalid' },
        };
      }

      // Card is valid and active
      this.logger.log(`[${cpId}] Authorization successful for card ${payload.idTag}`);
      return {
        idTagInfo: {
          status: 'Accepted',
          expiryDate: card.validUntil?.toISOString(),
          parentIdTag: card.parentIdTag,
        },
      };
    } catch (error) {
      this.logger.error(`[${cpId}] Authorization error: ${error.message}`, error.stack);
      return {
        idTagInfo: { status: 'Invalid' },
      };
    }
  }
}
