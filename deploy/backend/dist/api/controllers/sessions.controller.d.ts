import { Response } from 'express';
import { SessionsService } from '../../charging/sessions/sessions.service';
export declare class SessionsController {
    private readonly sessionsService;
    constructor(sessionsService: SessionsService);
    findAll(limit: string, res: Response): Promise<Response<any, Record<string, any>>>;
    findByStation(cpId: string, res: Response): Promise<Response<any, Record<string, any>>>;
}
