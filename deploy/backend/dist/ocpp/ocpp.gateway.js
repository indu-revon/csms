"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OcppGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const ws_1 = require("ws");
const ocpp_service_1 = require("./ocpp.service");
const logger_config_1 = require("../config/logger.config");
const stations_service_1 = require("../charging/stations/stations.service");
let OcppGateway = class OcppGateway {
    constructor(ocppService, stationsService) {
        this.ocppService = ocppService;
        this.stationsService = stationsService;
        this.logger = (0, logger_config_1.createLogger)('OcppGateway');
    }
    async handleConnection(client, req) {
        const cpId = this.extractCpId(req.url);
        this.logger.info(`WebSocket connection attempt - URL: ${req.url}, CP ID: ${cpId}, Remote: ${req.socket.remoteAddress}`);
        if (!cpId) {
            this.logger.warn('Connection rejected: No CP ID in URL');
            client.close(1008, 'Invalid CP ID');
            return;
        }
        const existingStation = await this.stationsService.findByOcppIdentifier(cpId);
        if (!existingStation) {
            this.logger.warn(`Connection rejected: Station ${cpId} not registered in the system`);
            client.close(1008, 'Station not registered');
            return;
        }
        await this.ocppService.registerConnection(cpId, client);
        this.logger.info(`Successfully registered CP: ${cpId}`);
    }
    async handleDisconnect(client) {
        await this.ocppService.handleDisconnect(client);
    }
    extractCpId(url) {
        if (!url)
            return null;
        const parts = url.split('/').filter(part => part.length > 0);
        if (parts.length > 0) {
            return parts[parts.length - 1];
        }
        return null;
    }
};
exports.OcppGateway = OcppGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", ws_1.Server)
], OcppGateway.prototype, "server", void 0);
exports.OcppGateway = OcppGateway = __decorate([
    (0, websockets_1.WebSocketGateway)(),
    __metadata("design:paramtypes", [ocpp_service_1.OcppService,
        stations_service_1.StationsService])
], OcppGateway);
//# sourceMappingURL=ocpp.gateway.js.map