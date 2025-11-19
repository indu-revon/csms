import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { ModelsService, CreateModelDto, UpdateModelDto } from '../../charging/models/models.service';

@Controller('api/models')
export class ModelsController {
  constructor(private readonly modelsService: ModelsService) {}

  @Get()
  async findAll() {
    return this.modelsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.modelsService.findById(id);
  }

  @Post()
  async create(@Body() data: CreateModelDto) {
    return this.modelsService.createModel(data);
  }

  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() data: UpdateModelDto) {
    return this.modelsService.updateModel(id, data);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.modelsService.deleteModel(id);
  }
}