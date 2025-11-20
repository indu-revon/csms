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
exports.ModelsService = void 0;
const common_1 = require("@nestjs/common");
const database_config_1 = require("../../config/database.config");
let ModelsService = class ModelsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createModel(data) {
        return this.prisma.stationModel.create({
            data,
        });
    }
    async findAll() {
        return this.prisma.stationModel.findMany();
    }
    async findById(id) {
        return this.prisma.stationModel.findUnique({
            where: { id },
        });
    }
    async findByName(name) {
        return this.prisma.stationModel.findUnique({
            where: { name },
        });
    }
    async updateModel(id, data) {
        return this.prisma.stationModel.update({
            where: { id },
            data,
        });
    }
    async deleteModel(id) {
        return this.prisma.stationModel.delete({
            where: { id },
        });
    }
};
exports.ModelsService = ModelsService;
exports.ModelsService = ModelsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_config_1.PrismaService])
], ModelsService);
//# sourceMappingURL=models.service.js.map