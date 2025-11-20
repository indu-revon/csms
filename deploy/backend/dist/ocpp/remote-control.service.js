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
exports.RemoteControlService = void 0;
const common_1 = require("@nestjs/common");
const ocpp_service_1 = require("./ocpp.service");
let RemoteControlService = class RemoteControlService {
    constructor(ocppService) {
        this.ocppService = ocppService;
    }
    async remoteStartTransaction(cpId, data) {
        return this.ocppService.sendCommand(cpId, 'RemoteStartTransaction', data);
    }
    async remoteStopTransaction(cpId, data) {
        return this.ocppService.sendCommand(cpId, 'RemoteStopTransaction', data);
    }
    async changeAvailability(cpId, data) {
        return this.ocppService.sendCommand(cpId, 'ChangeAvailability', data);
    }
    async reset(cpId, type = 'Soft') {
        return this.ocppService.sendCommand(cpId, 'Reset', { type });
    }
    async unlockConnector(cpId, connectorId) {
        return this.ocppService.sendCommand(cpId, 'UnlockConnector', { connectorId });
    }
    async getConfiguration(cpId, key) {
        return this.ocppService.sendCommand(cpId, 'GetConfiguration', { key });
    }
    async changeConfiguration(cpId, key, value) {
        return this.ocppService.sendCommand(cpId, 'ChangeConfiguration', { key, value });
    }
};
exports.RemoteControlService = RemoteControlService;
exports.RemoteControlService = RemoteControlService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [ocpp_service_1.OcppService])
], RemoteControlService);
//# sourceMappingURL=remote-control.service.js.map