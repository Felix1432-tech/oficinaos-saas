import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class MediaService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, query: any) {
    const { page = 1, limit = 20, usage, customerId, vehicleId } = query;
    const where: any = { tenantId };
    if (usage) where.usage = usage;
    if (customerId) where.customerId = customerId;
    if (vehicleId) where.vehicleId = vehicleId;

    const [items, total] = await Promise.all([
      this.prisma.mediaAsset.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.mediaAsset.count({ where }),
    ]);
    return { items, total, page, limit };
  }

  async upload(tenantId: string, data: any) {
    return this.prisma.mediaAsset.create({ data: { tenantId, ...data } });
  }

  async delete(tenantId: string, id: string) {
    await this.prisma.mediaAsset.deleteMany({ where: { id, tenantId } });
    return { message: 'Mídia excluída' };
  }

  // Stubs for AI features
  async generateImage(tenantId: string, id: string, prompt: string) {
    return { message: 'AI image generation not implemented', prompt };
  }

  async editImage(tenantId: string, id: string, prompt: string) {
    return { message: 'AI image editing not implemented', prompt };
  }

  async generateVideo(tenantId: string, id: string, prompt: string) {
    return { message: 'AI video generation not implemented', prompt };
  }
}
