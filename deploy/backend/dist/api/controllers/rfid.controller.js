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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RfidController = void 0;
const common_1 = require("@nestjs/common");
const rfid_service_1 = require("../../charging/rfid/rfid.service");
let RfidController = class RfidController {
    constructor(rfidService) {
        this.rfidService = rfidService;
    }
    async findAll() {
        return this.rfidService.findAll();
    }
    async findOne(tagId) {
        return this.rfidService.findByTagId(tagId);
    }
    async create(data) {
        try {
            console.log('Creating RFID card with data:', data);
            return await this.rfidService.createCard(data);
        }
        catch (error) {
            console.error('Error creating RFID card:', error);
            console.error('Error details:', {
                message: error.message,
                stack: error.stack,
                name: error.name
            });
            throw error;
        }
    }
    async blockCard(tagId) {
        return this.rfidService.updateCardStatus(tagId, 'Blocked');
    }
    async activateCard(tagId) {
        return this.rfidService.updateCardStatus(tagId, 'Active');
    }
    async deleteCard(tagId) {
        return this.rfidService.deleteCard(tagId);
    }
};
exports.RfidController = RfidController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RfidController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':tagId'),
    __param(0, (0, common_1.Param)('tagId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RfidController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RfidController.prototype, "create", null);
__decorate([
    (0, common_1.Post)(':tagId/block'),
    __param(0, (0, common_1.Param)('tagId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RfidController.prototype, "blockCard", null);
__decorate([
    (0, common_1.Post)(':tagId/activate'),
    __param(0, (0, common_1.Param)('tagId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RfidController.prototype, "activateCard", null);
__decorate([
    (0, common_1.Delete)(':tagId'),
    __param(0, (0, common_1.Param)('tagId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RfidController.prototype, "deleteCard", null);
exports.RfidController = RfidController = __decorate([
    (0, common_1.Controller)('api/rfid'),
    __metadata("design:paramtypes", [rfid_service_1.RfidService])
], RfidController);
//# sourceMappingURL=rfid.controller.js.map