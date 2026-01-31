import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CatalogService } from './catalog.service';
import { Tenant } from '../../common/decorators/tenant.decorator';

@ApiTags('catalog')
@ApiBearerAuth()
@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  // PARTS
  @Get('parts')
  @ApiOperation({ summary: 'Listar peças' })
  findAllParts(@Tenant() tenantId: string, @Query() query: any) {
    return this.catalogService.findAllParts(tenantId, query);
  }

  @Get('parts/:id')
  findOnePart(@Tenant() tenantId: string, @Param('id') id: string) {
    return this.catalogService.findOnePart(tenantId, id);
  }

  @Post('parts')
  createPart(@Tenant() tenantId: string, @Body() data: any) {
    return this.catalogService.createPart(tenantId, data);
  }

  @Put('parts/:id')
  updatePart(@Tenant() tenantId: string, @Param('id') id: string, @Body() data: any) {
    return this.catalogService.updatePart(tenantId, id, data);
  }

  @Delete('parts/:id')
  deletePart(@Tenant() tenantId: string, @Param('id') id: string) {
    return this.catalogService.deletePart(tenantId, id);
  }

  // SERVICES
  @Get('services')
  @ApiOperation({ summary: 'Listar serviços' })
  findAllServices(@Tenant() tenantId: string, @Query() query: any) {
    return this.catalogService.findAllServices(tenantId, query);
  }

  @Get('services/:id')
  findOneService(@Tenant() tenantId: string, @Param('id') id: string) {
    return this.catalogService.findOneService(tenantId, id);
  }

  @Post('services')
  createService(@Tenant() tenantId: string, @Body() data: any) {
    return this.catalogService.createService(tenantId, data);
  }

  @Put('services/:id')
  updateService(@Tenant() tenantId: string, @Param('id') id: string, @Body() data: any) {
    return this.catalogService.updateService(tenantId, id, data);
  }

  @Delete('services/:id')
  deleteService(@Tenant() tenantId: string, @Param('id') id: string) {
    return this.catalogService.deleteService(tenantId, id);
  }

  // SUPPLIERS
  @Get('suppliers')
  findAllSuppliers(@Tenant() tenantId: string, @Query() query: any) {
    return this.catalogService.findAllSuppliers(tenantId, query);
  }

  @Post('suppliers')
  createSupplier(@Tenant() tenantId: string, @Body() data: any) {
    return this.catalogService.createSupplier(tenantId, data);
  }

  // CONSUMABLES
  @Get('consumables')
  findAllConsumables(@Tenant() tenantId: string, @Query() query: any) {
    return this.catalogService.findAllConsumables(tenantId, query);
  }

  @Post('consumables')
  createConsumable(@Tenant() tenantId: string, @Body() data: any) {
    return this.catalogService.createConsumable(tenantId, data);
  }

  // LABOR RATES
  @Get('labor-rates')
  findAllLaborRates(@Tenant() tenantId: string) {
    return this.catalogService.findAllLaborRates(tenantId);
  }

  @Post('labor-rates')
  createLaborRate(@Tenant() tenantId: string, @Body() data: any) {
    return this.catalogService.createLaborRate(tenantId, data);
  }

  // CATEGORIES
  @Get('categories/:type')
  getCategories(@Tenant() tenantId: string, @Param('type') type: 'parts' | 'services') {
    return this.catalogService.getCategories(tenantId, type);
  }
}
