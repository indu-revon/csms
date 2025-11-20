"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiModule = void 0;
const common_1 = require("@nestjs/common");
const charging_module_1 = require("../charging/charging.module");
const ocpp_module_1 = require("../ocpp/ocpp.module");
const stations_controller_1 = require("./controllers/stations.controller");
const sessions_controller_1 = require("./controllers/sessions.controller");
const rfid_controller_1 = require("./controllers/rfid.controller");
const admin_controller_1 = require("./controllers/admin.controller");
const reservations_controller_1 = require("./controllers/reservations.controller");
const models_controller_1 = require("./controllers/models.controller");
const audit_controller_1 = require("./controllers/audit.controller");
let ApiModule = class ApiModule {
};
exports.ApiModule = ApiModule;
exports.ApiModule = ApiModule = __decorate([
    (0, common_1.Module)({
        imports: [charging_module_1.ChargingModule, ocpp_module_1.OcppModule],
        controllers: [
            stations_controller_1.StationsController,
            sessions_controller_1.SessionsController,
            rfid_controller_1.RfidController,
            admin_controller_1.AdminController,
            reservations_controller_1.ReservationsController,
            models_controller_1.ModelsController,
            audit_controller_1.AuditController,
        ],
    })
], ApiModule);
//# sourceMappingURL=api.module.js.map