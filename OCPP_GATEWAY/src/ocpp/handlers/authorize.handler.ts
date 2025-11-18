import { Injectable } from '@nestjs/common';
import { RfidService } from '../../charging/rfid/rfid.service';
import { AuthorizeRequest, AuthorizeResponse } from '../dtos/authorize.dto';

@Injectable()
export class AuthorizeHandler {
  constructor(private readonly rfidService: RfidService) {}

  async handle(cpId: string, payload: AuthorizeRequest): Promise<AuthorizeResponse> {
    const isValid = await this.rfidService.validateTag(payload.idTag);

    if (!isValid) {
      return {
        idTagInfo: {
          status: 'Invalid',
        },
      };
    }

    const card = await this.rfidService.findByTagId(payload.idTag);

    return {
      idTagInfo: {
        status: 'Accepted',
        expiryDate: card?.validUntil?.toISOString(),
      },
    };
  }
}
