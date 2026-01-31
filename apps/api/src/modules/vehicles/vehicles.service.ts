import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class VehiclesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, query: any) {
    const { page = 1, limit = 20, search, customerId, brand, model } = query;

    const where: any = { tenantId, deletedAt: null };

    if (customerId) where.customerId = customerId;
    if (brand) where.brand = { contains: brand, mode: 'insensitive' };
    if (model) where.model = { contains: model, mode: 'insensitive' };

    if (search) {
      where.OR = [
        { plate: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.vehicle.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { id: true, name: true, phone: true } },
        },
      }),
      this.prisma.vehicle.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    };
  }

  async findOne(tenantId: string, id: string) {
    const vehicle = await this.prisma.vehicle.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        customer: true,
        cards: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: { stage: true },
        },
        proposals: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        workOrders: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!vehicle) {
      throw new NotFoundException('Veículo não encontrado');
    }

    return vehicle;
  }

  async findByPlate(tenantId: string, plate: string) {
    return this.prisma.vehicle.findFirst({
      where: { tenantId, plate: plate.toUpperCase(), deletedAt: null },
      include: {
        customer: { select: { id: true, name: true, phone: true } },
      },
    });
  }

  async create(tenantId: string, data: any) {
    const plate = data.plate.toUpperCase().replace(/[^A-Z0-9]/g, '');

    const existing = await this.prisma.vehicle.findFirst({
      where: { tenantId, plate, deletedAt: null },
    });

    if (existing) {
      throw new ConflictException('Veículo com esta placa já existe');
    }

    return this.prisma.vehicle.create({
      data: {
        tenantId,
        ...data,
        plate,
      },
      include: {
        customer: { select: { id: true, name: true } },
      },
    });
  }

  async update(tenantId: string, id: string, data: any) {
    const vehicle = await this.prisma.vehicle.findFirst({
      where: { id, tenantId, deletedAt: null },
    });

    if (!vehicle) {
      throw new NotFoundException('Veículo não encontrado');
    }

    return this.prisma.vehicle.update({
      where: { id },
      data,
      include: {
        customer: { select: { id: true, name: true } },
      },
    });
  }

  async remove(tenantId: string, id: string) {
    const vehicle = await this.prisma.vehicle.findFirst({
      where: { id, tenantId, deletedAt: null },
    });

    if (!vehicle) {
      throw new NotFoundException('Veículo não encontrado');
    }

    await this.prisma.vehicle.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { message: 'Veículo excluído com sucesso' };
  }
}
