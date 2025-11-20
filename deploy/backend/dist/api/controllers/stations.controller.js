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
exports.StationsController = void 0;
const common_1 = require("@nestjs/common");
const stations_service_1 = require("../../charging/stations/stations.service");
const ocpp_service_1 = require("../../ocpp/ocpp.service");
function replacer(key, value) {
    if (typeof value === 'bigint') {
        return value.toString();
    }
    return value;
}
let StationsController = class StationsController {
    constructor(stationsService, ocppService) {
        this.stationsService = stationsService;
        this.ocppService = ocppService;
    }
    async findAll(res) {
        try {
            const stations = await this.stationsService.findAll();
            const result = stations.map(station => ({
                ...station,
                isConnected: this.ocppService.isStationConnected(station.ocppIdentifier),
            }));
            const serializedResult = JSON.parse(JSON.stringify(result, replacer));
            return res.json(serializedResult);
        }
        catch (error) {
            console.error('Error fetching stations:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
    async findOne(cpId, res) {
        try {
            const station = await this.stationsService.findByOcppIdentifier(cpId);
            const result = {
                ...station,
                isConnected: this.ocppService.isStationConnected(cpId),
            };
            const serializedResult = JSON.parse(JSON.stringify(result, replacer));
            return res.json(serializedResult);
        }
        catch (error) {
            console.error('Error fetching station:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
    async getConnectedStations(res) {
        try {
            const result = {
                connectedStations: this.ocppService.getConnectedStations(),
            };
            return res.json(result);
        }
        catch (error) {
            console.error('Error fetching connected stations:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
    async create(createStationDto, res) {
        try {
            const station = await this.stationsService.upsertStation(createStationDto);
            const serializedResult = JSON.parse(JSON.stringify(station, replacer));
            return res.status(201).json(serializedResult);
        }
        catch (error) {
            console.error('Error creating station:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
    async update(cpId, updateStationDto, res) {
        try {
            const existingStation = await this.stationsService.findByOcppIdentifier(cpId);
            if (!existingStation) {
                return res.status(404).json({ error: 'Station not found' });
            }
            const station = await this.stationsService.updateStation(cpId, updateStationDto);
            const serializedResult = JSON.parse(JSON.stringify(station, replacer));
            return res.json(serializedResult);
        }
        catch (error) {
            console.error('Error updating station:', error);
            if (error.code === 'P2025') {
                return res.status(404).json({ error: 'Station not found' });
            }
            return res.status(500).json({ error: 'Internal server error', message: error.message });
        }
    }
    async delete(cpId, res) {
        try {
            const existingStation = await this.stationsService.findByOcppIdentifier(cpId);
            if (!existingStation) {
                return res.status(404).json({ error: 'Station not found' });
            }
            if (this.ocppService.isStationConnected(cpId)) {
                return res.status(400).json({ error: 'Cannot delete connected station' });
            }
            await this.stationsService.deleteStation(cpId);
            return res.status(204).send();
        }
        catch (error) {
            console.error('Error deleting station:', error);
            if (error.code === 'P2025') {
                return res.status(404).json({ error: 'Station not found' });
            }
            return res.status(500).json({ error: 'Internal server error', message: error.message });
        }
    }
};
exports.StationsController = StationsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StationsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':cpId'),
    __param(0, (0, common_1.Param)('cpId')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], StationsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)('connected/list'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StationsController.prototype, "getConnectedStations", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], StationsController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':cpId'),
    __param(0, (0, common_1.Param)('cpId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], StationsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':cpId'),
    __param(0, (0, common_1.Param)('cpId')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], StationsController.prototype, "delete", null);
exports.StationsController = StationsController = __decorate([
    (0, common_1.Controller)('api/stations'),
    __metadata("design:paramtypes", [stations_service_1.StationsService,
        ocpp_service_1.OcppService])
], StationsController);
//# sourceMappingURL=stations.controller.js.map