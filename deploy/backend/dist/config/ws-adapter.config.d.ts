import { WsAdapter } from '@nestjs/platform-ws';
import { INestApplicationContext } from '@nestjs/common';
import { ServerOptions } from 'ws';
export declare class OcppWsAdapter extends WsAdapter {
    constructor(appOrHttpServer: INestApplicationContext | any);
    bindClientConnect(server: any, callback: Function): void;
    create(port: number, options?: ServerOptions): any;
}
