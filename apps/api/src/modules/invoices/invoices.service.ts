import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class InvoicesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, query: any) {
    const { page = 1, limit = 20, status } = query;
    const where: any = { tenantId };
    if (status) where.status = status;

    const [items, total] = await Promise.all([
      this.prisma.invoiceImport.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.invoiceImport.count({ where }),
    ]);
    return { items, total, page, limit };
  }

  async findOne(tenantId: string, id: string) {
    const invoice = await this.prisma.invoiceImport.findFirst({
      where: { id, tenantId },
      include: { items: true, supplier: true },
    });
    if (!invoice) throw new NotFoundException('Nota não encontrada');
    return invoice;
  }

  async import(tenantId: string, data: any) {
    // TODO: Process file and extract items
    return this.prisma.invoiceImport.create({
      data: { tenantId, fileUrl: data.fileUrl, fileType: data.fileType || 'unknown', status: 'PENDING' },
    });
  }

  async confirm(tenantId: string, id: string, items: any[]) {
    const invoice = await this.findOne(tenantId, id);

    // TODO: Create inventory entries and update stock
    await this.prisma.invoiceImport.update({
      where: { id },
      data: { status: 'CONFIRMED', confirmedAt: new Date() },
    });

    return { message: 'Nota confirmada' };
  }
}
