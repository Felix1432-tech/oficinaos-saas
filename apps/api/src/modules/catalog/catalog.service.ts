import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  // PARTS
  async findAllParts(tenantId: string, query: any) {
    const { page = 1, limit = 20, category, search, lowStock } = query;
    const where: any = { tenantId, deletedAt: null };
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (lowStock) where.stockQty = { lt: where.minStock };

    const [items, total] = await Promise.all([
      this.prisma.catalogPart.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { name: 'asc' } }),
      this.prisma.catalogPart.count({ where }),
    ]);
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOnePart(tenantId: string, id: string) {
    const part = await this.prisma.catalogPart.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!part) throw new NotFoundException('Peça não encontrada');
    return part;
  }

  async createPart(tenantId: string, data: any) {
    return this.prisma.catalogPart.create({ data: { tenantId, ...data } });
  }

  async updatePart(tenantId: string, id: string, data: any) {
    await this.findOnePart(tenantId, id);
    return this.prisma.catalogPart.update({ where: { id }, data });
  }

  async deletePart(tenantId: string, id: string) {
    await this.findOnePart(tenantId, id);
    await this.prisma.catalogPart.update({ where: { id }, data: { deletedAt: new Date() } });
    return { message: 'Peça excluída' };
  }

  // SERVICES
  async findAllServices(tenantId: string, query: any) {
    const { page = 1, limit = 20, category, search } = query;
    const where: any = { tenantId, deletedAt: null };
    if (category) where.category = category;
    if (search) where.name = { contains: search, mode: 'insensitive' };

    const [items, total] = await Promise.all([
      this.prisma.catalogService.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { name: 'asc' },
        include: { laborRate: true },
      }),
      this.prisma.catalogService.count({ where }),
    ]);
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOneService(tenantId: string, id: string) {
    const service = await this.prisma.catalogService.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: { laborRate: true, parts: { include: { part: true } }, consumables: { include: { consumable: true } } },
    });
    if (!service) throw new NotFoundException('Serviço não encontrado');
    return service;
  }

  async createService(tenantId: string, data: any) {
    return this.prisma.catalogService.create({ data: { tenantId, ...data } });
  }

  async updateService(tenantId: string, id: string, data: any) {
    await this.findOneService(tenantId, id);
    return this.prisma.catalogService.update({ where: { id }, data });
  }

  async deleteService(tenantId: string, id: string) {
    await this.findOneService(tenantId, id);
    await this.prisma.catalogService.update({ where: { id }, data: { deletedAt: new Date() } });
    return { message: 'Serviço excluído' };
  }

  // SUPPLIERS
  async findAllSuppliers(tenantId: string, query: any) {
    const { page = 1, limit = 20 } = query;
    const [items, total] = await Promise.all([
      this.prisma.supplier.findMany({ where: { tenantId }, skip: (page - 1) * limit, take: limit }),
      this.prisma.supplier.count({ where: { tenantId } }),
    ]);
    return { items, total, page, limit };
  }

  async createSupplier(tenantId: string, data: any) {
    return this.prisma.supplier.create({ data: { tenantId, ...data } });
  }

  // CONSUMABLES
  async findAllConsumables(tenantId: string, query: any) {
    const { page = 1, limit = 20 } = query;
    const [items, total] = await Promise.all([
      this.prisma.catalogConsumable.findMany({ where: { tenantId, deletedAt: null }, skip: (page - 1) * limit, take: limit }),
      this.prisma.catalogConsumable.count({ where: { tenantId, deletedAt: null } }),
    ]);
    return { items, total, page, limit };
  }

  async createConsumable(tenantId: string, data: any) {
    return this.prisma.catalogConsumable.create({ data: { tenantId, ...data } });
  }

  // LABOR RATES
  async findAllLaborRates(tenantId: string) {
    return this.prisma.laborRate.findMany({ where: { tenantId }, orderBy: { name: 'asc' } });
  }

  async createLaborRate(tenantId: string, data: any) {
    return this.prisma.laborRate.create({ data: { tenantId, ...data } });
  }

  // CATEGORIES
  async getCategories(tenantId: string, type: 'parts' | 'services') {
    if (type === 'parts') {
      const result = await this.prisma.catalogPart.groupBy({ by: ['category'], where: { tenantId, deletedAt: null }, _count: true });
      return result.map(r => ({ category: r.category, count: r._count }));
    }
    const result = await this.prisma.catalogService.groupBy({ by: ['category'], where: { tenantId, deletedAt: null }, _count: true });
    return result.map(r => ({ category: r.category, count: r._count }));
  }
}
