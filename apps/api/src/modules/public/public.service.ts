import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class PublicService {
  constructor(private readonly prisma: PrismaService) {}

  async getLandingConfig(tenantSlug: string) {
    const tenant = await this.prisma.tenant.findUnique({ where: { slug: tenantSlug } });
    if (!tenant) throw new NotFoundException('Oficina não encontrada');

    const config = await this.prisma.publicPageConfig.findUnique({
      where: { tenantId: tenant.id },
      include: { servicesVisible: { include: { service: true }, orderBy: { position: 'asc' } } },
    });

    return { tenant: { name: tenant.name, slug: tenant.slug }, config };
  }

  async getPublicServices(tenantSlug: string) {
    const tenant = await this.prisma.tenant.findUnique({ where: { slug: tenantSlug } });
    if (!tenant) throw new NotFoundException('Oficina não encontrada');

    const config = await this.prisma.publicPageConfig.findUnique({
      where: { tenantId: tenant.id },
      include: { servicesVisible: { include: { service: true }, orderBy: { position: 'asc' } } },
    });

    return config?.servicesVisible || [];
  }

  async submitQuote(tenantSlug: string, data: any) {
    const tenant = await this.prisma.tenant.findUnique({ where: { slug: tenantSlug } });
    if (!tenant) throw new NotFoundException('Oficina não encontrada');

    // Create or find customer
    let customer = await this.prisma.customer.findFirst({
      where: { tenantId: tenant.id, phone: data.contact.phone, deletedAt: null },
    });

    if (!customer) {
      customer = await this.prisma.customer.create({
        data: { tenantId: tenant.id, name: data.contact.name, phone: data.contact.phone, email: data.contact.email, source: 'Orçamento Online' },
      });
    }

    // Create or find vehicle
    let vehicle = null;
    if (data.vehicle?.plate) {
      const plate = data.vehicle.plate.toUpperCase().replace(/[^A-Z0-9]/g, '');
      vehicle = await this.prisma.vehicle.findFirst({ where: { tenantId: tenant.id, plate, deletedAt: null } });
      if (!vehicle) {
        vehicle = await this.prisma.vehicle.create({
          data: { tenantId: tenant.id, customerId: customer.id, plate, brand: data.vehicle.brand || 'Não informado', model: data.vehicle.model || 'Não informado', year: data.vehicle.year, mileage: data.vehicle.mileage },
        });
      }
    }

    // Get first stage
    const stage = await this.prisma.crmStage.findFirst({ where: { tenantId: tenant.id }, orderBy: { position: 'asc' } });
    if (!stage) throw new NotFoundException('Pipeline não configurado');

    // Create CRM card
    const card = await this.prisma.crmCard.create({
      data: {
        tenantId: tenant.id,
        stageId: stage.id,
        customerId: customer.id,
        vehicleId: vehicle?.id,
        title: `Orçamento Online - ${customer.name}`,
        channel: 'Website',
        status: data.completed ? 'ACTIVE' : 'ABANDONED',
        estimatedValue: data.estimatedTotal ? new Decimal(data.estimatedTotal) : null,
        complaint: data.category,
        diagnosis: JSON.stringify(data.answers || {}),
        position: 0,
      },
    });

    return { success: true, cardId: card.id, message: 'Orçamento recebido com sucesso!' };
  }

  async getQuoteEstimate(tenantSlug: string, serviceIds: string[]) {
    const tenant = await this.prisma.tenant.findUnique({ where: { slug: tenantSlug } });
    if (!tenant) throw new NotFoundException('Oficina não encontrada');

    const services = await this.prisma.catalogService.findMany({
      where: { tenantId: tenant.id, id: { in: serviceIds }, deletedAt: null },
      include: { laborRate: true },
    });

    let totalPrice = 0;
    let totalTime = 0;

    const items = services.map(s => {
      const price = Number(s.suggestedPrice);
      const time = Number(s.defaultTimeHrs);
      totalPrice += price;
      totalTime += time;
      return { id: s.id, name: s.name, price, timeHours: time };
    });

    return {
      services: items,
      subtotal: totalPrice,
      estimatedTime: `${Math.floor(totalTime)}h ${Math.round((totalTime % 1) * 60)}min`,
    };
  }
}
