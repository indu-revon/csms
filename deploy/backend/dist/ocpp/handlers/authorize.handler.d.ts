import { RfidService } from '../../charging/rfid/rfid.service';
import { AuthorizeRequest, AuthorizeResponse } from '../dtos/authorize.dto';
export declare class AuthorizeHandler {
    private readonly rfidService;
    constructor(rfidService: RfidService);
    handle(cpId: string, payload: AuthorizeRequest): Promise<AuthorizeResponse>;
}
