"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OcppModule = void 0;
const common_1 = require("@nestjs/common");
const ocpp_service_1 = require("./ocpp.service");
const remote_control_service_1 = require("./remote-control.service");
const charging_module_1 = require("../charging/charging.module");
const boot_notification_handler_1 = require("./handlers/boot-notification.handler");
const heartbeat_handler_1 = require("./handlers/heartbeat.handler");
const status_notification_handler_1 = require("./handlers/status-notification.handler");
const authorize_handler_1 = require("./handlers/authorize.handler");
const start_transaction_handler_1 = require("./handlers/start-transaction.handler");
const stop_transaction_handler_1 = require("./handlers/stop-transaction.handler");
const meter_values_handler_1 = require("./handlers/meter-values.handler");
const reserve_now_handler_1 = require("./handlers/reserve-now.handler");
const cancel_reservation_handler_1 = require("./handlers/cancel-reservation.handler");
let OcppModule = class OcppModule {
};
exports.OcppModule = OcppModule;
exports.OcppModule = OcppModule = __decorate([
    (0, common_1.Module)({
        imports: [charging_module_1.ChargingModule],
        providers: [
            ocpp_service_1.OcppService,
            remote_control_service_1.RemoteControlService,
            boot_notification_handler_1.BootNotificationHandler,
            heartbeat_handler_1.HeartbeatHandler,
            status_notification_handler_1.StatusNotificationHandler,
            authorize_handler_1.AuthorizeHandler,
            start_transaction_handler_1.StartTransactionHandler,
            stop_transaction_handler_1.StopTransactionHandler,
            meter_values_handler_1.MeterValuesHandler,
            reserve_now_handler_1.ReserveNowHandler,
            cancel_reservation_handler_1.CancelReservationHandler,
        ],
        exports: [ocpp_service_1.OcppService, remote_control_service_1.RemoteControlService],
    })
], OcppModule);
//# sourceMappingURL=ocpp.module.js.map