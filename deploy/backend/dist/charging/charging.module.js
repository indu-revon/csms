"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChargingModule = void 0;
const common_1 = require("@nestjs/common");
const database_config_1 = require("../config/database.config");
const stations_service_1 = require("./stations/stations.service");
const connectors_service_1 = require("./connectors/connectors.service");
const sessions_service_1 = require("./sessions/sessions.service");
const rfid_service_1 = require("./rfid/rfid.service");
const reservations_service_1 = require("./reservations/reservations.service");
const models_service_1 = require("./models/models.service");
const audit_log_service_1 = require("../audit/audit-log.service");
let ChargingModule = class ChargingModule {
};
exports.ChargingModule = ChargingModule;
exports.ChargingModule = ChargingModule = __decorate([
    (0, common_1.Module)({
        providers: [
            database_config_1.PrismaService,
            stations_service_1.StationsService,
            connectors_service_1.ConnectorsService,
            sessions_service_1.SessionsService,
            rfid_service_1.RfidService,
            reservations_service_1.ReservationsService,
            models_service_1.ModelsService,
            audit_log_service_1.AuditLogService,
        ],
        exports: [
            stations_service_1.StationsService,
            connectors_service_1.ConnectorsService,
            sessions_service_1.SessionsService,
            rfid_service_1.RfidService,
            reservations_service_1.ReservationsService,
            models_service_1.ModelsService,
            audit_log_service_1.AuditLogService,
        ],
    })
], ChargingModule);
//# sourceMappingURL=charging.module.js.map