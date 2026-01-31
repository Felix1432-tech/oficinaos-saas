import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { InvoicesService } from './invoices.service';
import { Tenant } from '../../common/decorators/tenant.decorator';

@ApiTags('invoices')
@ApiBearerAuth()
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get()
  findAll(@Tenant() tenantId: string, @Query() query: any) {
    return this.invoicesService.findAll(tenantId, query);
  }

  @Get(':id')
  findOne(@Tenant() tenantId: string, @Param('id') id: string) {
    return this.invoicesService.findOne(tenantId, id);
  }

  @Post('import')
  import(@Tenant() tenantId: string, @Body() data: any) {
    return this.invoicesService.import(tenantId, data);
  }

  @Post(':id/confirm')
  confirm(@Tenant() tenantId: string, @Param('id') id: string, @Body() body: { items: any[] }) {
    return this.invoicesService.confirm(tenantId, id, body.items);
  }
}
