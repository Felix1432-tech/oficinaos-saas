import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { WorkOrdersService } from './work-orders.service';
import { Tenant } from '../../common/decorators/tenant.decorator';

@ApiTags('work-orders')
@ApiBearerAuth()
@Controller('work-orders')
export class WorkOrdersController {
  constructor(private readonly workOrdersService: WorkOrdersService) {}

  @Get()
  findAll(@Tenant() tenantId: string, @Query() query: any) {
    return this.workOrdersService.findAll(tenantId, query);
  }

  @Get(':id')
  findOne(@Tenant() tenantId: string, @Param('id') id: string) {
    return this.workOrdersService.findOne(tenantId, id);
  }

  @Post()
  create(@Tenant() tenantId: string, @Body() data: any) {
    return this.workOrdersService.create(tenantId, data);
  }

  @Put(':id')
  update(@Tenant() tenantId: string, @Param('id') id: string, @Body() data: any) {
    return this.workOrdersService.update(tenantId, id, data);
  }

  @Post(':id/start')
  start(@Tenant() tenantId: string, @Param('id') id: string) {
    return this.workOrdersService.start(tenantId, id);
  }

  @Post(':id/complete')
  complete(@Tenant() tenantId: string, @Param('id') id: string) {
    return this.workOrdersService.complete(tenantId, id);
  }

  @Post(':id/deliver')
  deliver(@Tenant() tenantId: string, @Param('id') id: string) {
    return this.workOrdersService.deliver(tenantId, id);
  }
}
