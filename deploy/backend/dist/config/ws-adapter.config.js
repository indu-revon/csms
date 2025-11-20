"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OcppWsAdapter = void 0;
const platform_ws_1 = require("@nestjs/platform-ws");
class OcppWsAdapter extends platform_ws_1.WsAdapter {
    constructor(appOrHttpServer) {
        super(appOrHttpServer);
    }
    bindClientConnect(server, callback) {
        console.log('bindClientConnect called');
        server.on('connection', callback);
    }
    create(port, options) {
        console.log('OcppWsAdapter.create called with port:', port);
        const wsOptions = {
            handleProtocols: (protocols, request) => {
                console.log('handleProtocols called with:', Array.from(protocols));
                if (protocols.has('ocpp1.6')) {
                    return 'ocpp1.6';
                }
                return Array.from(protocols)[0] || '';
            },
        };
        const wsServer = super.create(port, wsOptions);
        console.log('WebSocket server created via parent adapter');
        return wsServer;
    }
}
exports.OcppWsAdapter = OcppWsAdapter;
//# sourceMappingURL=ws-adapter.config.js.map