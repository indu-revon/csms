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
exports.AuthorizeHandler = void 0;
const common_1 = require("@nestjs/common");
const rfid_service_1 = require("../../charging/rfid/rfid.service");
let AuthorizeHandler = class AuthorizeHandler {
    constructor(rfidService) {
        this.rfidService = rfidService;
    }
    async handle(cpId, payload) {
        const isValid = await this.rfidService.validateTag(payload.idTag);
        if (!isValid) {
            return {
                idTagInfo: {
                    status: 'Invalid',
                },
            };
        }
        const card = await this.rfidService.findByTagId(payload.idTag);
        return {
            idTagInfo: {
                status: 'Accepted',
                expiryDate: card?.validUntil?.toISOString(),
            },
        };
    }
};
exports.AuthorizeHandler = AuthorizeHandler;
exports.AuthorizeHandler = AuthorizeHandler = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [rfid_service_1.RfidService])
], AuthorizeHandler);
//# sourceMappingURL=authorize.handler.js.map