import { WsAdapter } from '@nestjs/platform-ws';
import { INestApplicationContext } from '@nestjs/common';
import { ServerOptions } from 'ws';
import * as http from 'http';

export class OcppWsAdapter extends WsAdapter {
  constructor(appOrHttpServer: INestApplicationContext | any) {
    super(appOrHttpServer);
  }

  bindClientConnect(server: any, callback: Function) {
    console.log('bindClientConnect called');
    server.on('connection', callback);
  }

  create(port: number, options?: ServerOptions): any {
    console.log('OcppWsAdapter.create called with port:', port);
    
    // Don't pass server in options - let parent class handle it
    const wsOptions: ServerOptions = {
      handleProtocols: (protocols, request) => {
        console.log('handleProtocols called with:', Array.from(protocols));
        // Accept ocpp1.6 or any other protocol  
        if (protocols.has('ocpp1.6')) {
          return 'ocpp1.6';
        }
        // Accept connection without protocol requirement
        return Array.from(protocols)[0] || '';
      },
    };
    
    const wsServer = super.create(port, wsOptions);
    console.log('WebSocket server created via parent adapter');
    
    return wsServer;
  }
}
