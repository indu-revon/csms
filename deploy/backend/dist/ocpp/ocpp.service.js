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
exports.OcppService = void 0;
const common_1 = require("@nestjs/common");
const logger_config_1 = require("../config/logger.config");
const enums_1 = require("../common/enums");
const stations_service_1 = require("../charging/stations/stations.service");
const boot_notification_handler_1 = require("./handlers/boot-notification.handler");
const heartbeat_handler_1 = require("./handlers/heartbeat.handler");
const status_notification_handler_1 = require("./handlers/status-notification.handler");
const authorize_handler_1 = require("./handlers/authorize.handler");
const start_transaction_handler_1 = require("./handlers/start-transaction.handler");
const stop_transaction_handler_1 = require("./handlers/stop-transaction.handler");
const meter_values_handler_1 = require("./handlers/meter-values.handler");
const reserve_now_handler_1 = require("./handlers/reserve-now.handler");
const cancel_reservation_handler_1 = require("./handlers/cancel-reservation.handler");
let OcppService = class OcppService {
    constructor(stationsService, bootNotificationHandler, heartbeatHandler, statusNotificationHandler, authorizeHandler, startTransactionHandler, stopTransactionHandler, meterValuesHandler, reserveNowHandler, cancelReservationHandler) {
        this.stationsService = stationsService;
        this.bootNotificationHandler = bootNotificationHandler;
        this.heartbeatHandler = heartbeatHandler;
        this.statusNotificationHandler = statusNotificationHandler;
        this.authorizeHandler = authorizeHandler;
        this.startTransactionHandler = startTransactionHandler;
        this.stopTransactionHandler = stopTransactionHandler;
        this.meterValuesHandler = meterValuesHandler;
        this.reserveNowHandler = reserveNowHandler;
        this.cancelReservationHandler = cancelReservationHandler;
        this.logger = (0, logger_config_1.createLogger)('OcppService');
        this.cpConnections = new Map();
        this.socketToCpId = new Map();
    }
    async registerConnection(cpId, client) {
        this.logger.info(`Charge point connected: ${cpId}`);
        this.cpConnections.set(cpId, {
            cpId,
            socket: client,
            connectedAt: new Date(),
        });
        this.socketToCpId.set(client, cpId);
        client.on('message', (raw) => {
            this.handleIncomingMessage(client, raw.toString());
        });
        client.on('error', (error) => {
            this.logger.error(`WebSocket error for ${cpId}: ${error.message}`);
        });
    }
    async handleDisconnect(client) {
        const cpId = this.socketToCpId.get(client);
        if (cpId) {
            this.logger.info(`Charge point disconnected: ${cpId}`);
            this.cpConnections.delete(cpId);
            this.socketToCpId.delete(client);
            try {
                await this.stationsService.markOffline(cpId);
            }
            catch (error) {
                this.logger.error(`Error marking station offline: ${error.message}`);
            }
        }
    }
    async handleIncomingMessage(client, raw) {
        const cpId = this.socketToCpId.get(client);
        if (!cpId) {
            this.logger.warn('Received message from unregistered client');
            return;
        }
        let msg;
        try {
            msg = JSON.parse(raw);
            this.logger.info(`[${cpId}] Received: ${JSON.stringify(msg)}`);
        }
        catch (error) {
            this.logger.error(`Invalid JSON from ${cpId}: ${raw}`);
            return;
        }
        const [messageTypeId, uniqueId, actionOrPayload, payloadIfCall] = msg;
        switch (messageTypeId) {
            case enums_1.OcppMessageType.CALL:
                await this.handleCall(client, cpId, uniqueId, actionOrPayload, payloadIfCall);
                break;
            case enums_1.OcppMessageType.CALL_RESULT:
                this.logger.info(`[${cpId}] Received CALLRESULT for ${uniqueId}`);
                break;
            case enums_1.OcppMessageType.CALL_ERROR:
                this.logger.error(`[${cpId}] Received CALLERROR for ${uniqueId}: ${actionOrPayload}`);
                break;
            default:
                this.logger.warn(`Unknown message type: ${messageTypeId}`);
        }
    }
    async handleCall(client, cpId, uniqueId, action, payload) {
        let responsePayload;
        try {
            switch (action) {
                case 'BootNotification':
                    responsePayload = await this.bootNotificationHandler.handle(cpId, payload);
                    break;
                case 'Heartbeat':
                    responsePayload = await this.heartbeatHandler.handle(cpId, payload);
                    break;
                case 'StatusNotification':
                    responsePayload = await this.statusNotificationHandler.handle(cpId, payload);
                    break;
                case 'Authorize':
                    responsePayload = await this.authorizeHandler.handle(cpId, payload);
                    break;
                case 'StartTransaction':
                    responsePayload = await this.startTransactionHandler.handle(cpId, payload);
                    break;
                case 'StopTransaction':
                    responsePayload = await this.stopTransactionHandler.handle(cpId, payload);
                    break;
                case 'MeterValues':
                    responsePayload = await this.meterValuesHandler.handle(cpId, payload);
                    break;
                case 'ReserveNow':
                    responsePayload = await this.reserveNowHandler.handle(cpId, payload);
                    break;
                case 'CancelReservation':
                    responsePayload = await this.cancelReservationHandler.handle(cpId, payload);
                    break;
                default:
                    this.logger.warn(`Unknown action: ${action}`);
                    this.sendCallError(client, uniqueId, 'NotImplemented', `Action ${action} not implemented`);
                    return;
            }
            this.sendCallResult(client, cpId, uniqueId, responsePayload);
        }
        catch (error) {
            this.logger.error(`Error handling ${action}: ${error.message}`, { error });
            this.sendCallError(client, uniqueId, 'InternalError', error.message);
        }
    }
    sendCallResult(client, cpId, uniqueId, payload) {
        const response = [enums_1.OcppMessageType.CALL_RESULT, uniqueId, payload];
        const message = JSON.stringify(response);
        this.logger.info(`[${cpId}] Sending: ${message}`);
        client.send(message);
    }
    sendCallError(client, uniqueId, errorCode, errorDescription) {
        const response = [
            enums_1.OcppMessageType.CALL_ERROR,
            uniqueId,
            errorCode,
            errorDescription,
            {},
        ];
        client.send(JSON.stringify(response));
    }
    async sendCommand(cpId, action, payload) {
        const connection = this.cpConnections.get(cpId);
        if (!connection) {
            throw new Error(`Charge point ${cpId} not connected`);
        }
        const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
        const message = [enums_1.OcppMessageType.CALL, uniqueId, action, payload];
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Command timeout'));
            }, 30000);
            connection.socket.once('message', (raw) => {
                clearTimeout(timeout);
                try {
                    const response = JSON.parse(raw.toString());
                    if (response[0] === enums_1.OcppMessageType.CALL_RESULT && response[1] === uniqueId) {
                        resolve(response[2]);
                    }
                    else if (response[0] === enums_1.OcppMessageType.CALL_ERROR && response[1] === uniqueId) {
                        reject(new Error(response[3]));
                    }
                }
                catch (error) {
                    reject(error);
                }
            });
            connection.socket.send(JSON.stringify(message));
            this.logger.info(`[${cpId}] Sent command: ${action}`);
        });
    }
    getConnectedStations() {
        return Array.from(this.cpConnections.keys());
    }
    isStationConnected(cpId) {
        return this.cpConnections.has(cpId);
    }
};
exports.OcppService = OcppService;
exports.OcppService = OcppService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [stations_service_1.StationsService,
        boot_notification_handler_1.BootNotificationHandler,
        heartbeat_handler_1.HeartbeatHandler,
        status_notification_handler_1.StatusNotificationHandler,
        authorize_handler_1.AuthorizeHandler,
        start_transaction_handler_1.StartTransactionHandler,
        stop_transaction_handler_1.StopTransactionHandler,
        meter_values_handler_1.MeterValuesHandler,
        reserve_now_handler_1.ReserveNowHandler,
        cancel_reservation_handler_1.CancelReservationHandler])
], OcppService);
//# sourceMappingURL=ocpp.service.js.map