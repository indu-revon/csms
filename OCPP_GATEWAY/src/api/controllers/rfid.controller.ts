import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { RfidService, CreateRfidCardDto } from '../../charging/rfid/rfid.service';

@Controller('api/rfid')
export class RfidController {
  constructor(private readonly rfidService: RfidService) {}

  @Get()
  async findAll() {
    return this.rfidService.findAll();
  }

  @Get(':tagId')
  async findOne(@Param('tagId') tagId: string) {
    return this.rfidService.findByTagId(tagId);
  }

  @Post()
  async create(@Body() data: CreateRfidCardDto) {
    try {
      console.log('Creating RFID card with data:', data);
      return await this.rfidService.createCard(data);
    } catch (error) {
      console.error('Error creating RFID card:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      throw error;
    }
  }

  @Post(':tagId/block')
  async blockCard(@Param('tagId') tagId: string) {
    return this.rfidService.updateCardStatus(tagId, 'Blocked');
  }

  @Post(':tagId/activate')
  async activateCard(@Param('tagId') tagId: string) {
    return this.rfidService.updateCardStatus(tagId, 'Active');
  }
}
