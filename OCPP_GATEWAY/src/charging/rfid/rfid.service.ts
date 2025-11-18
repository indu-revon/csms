import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/database.config';

export interface CreateRfidCardDto {
  tagId: string;
  status: string;
  validFrom?: Date;
  validUntil?: Date;
  userId?: number;
}

@Injectable()
export class RfidService {
  constructor(private readonly prisma: PrismaService) {}

  async validateTag(tagId: string): Promise<boolean> {
    const card = await this.prisma.rfidCard.findUnique({
      where: { tagId },
    });

    if (!card) {
      return false;
    }

    if (card.status !== 'Active') {
      return false;
    }

    const now = new Date();

    if (card.validFrom && card.validFrom > now) {
      return false;
    }

    if (card.validUntil && card.validUntil < now) {
      return false;
    }

    return true;
  }

  async findByTagId(tagId: string) {
    return this.prisma.rfidCard.findUnique({
      where: { tagId },
    });
  }

  async createCard(data: CreateRfidCardDto) {
    try {
      // Convert userId from string to number if provided
      const processedData = {
        ...data,
        userId: data.userId !== undefined && data.userId !== null ? 
          parseInt(data.userId.toString(), 10) : 
          null,
      };
      
      console.log('Processed RFID data:', processedData);
      
      return this.prisma.rfidCard.create({
        data: processedData,
      });
    } catch (error) {
      console.error('Error in RFID service createCard:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      throw error;
    }
  }

  async updateCardStatus(tagId: string, status: string) {
    return this.prisma.rfidCard.update({
      where: { tagId },
      data: { status },
    });
  }

  async deleteCard(tagId: string) {
    return this.prisma.rfidCard.delete({
      where: { tagId },
    });
  }

  async findAll() {
    return this.prisma.rfidCard.findMany();
  }
}