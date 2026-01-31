import { Controller, Get, Put, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TenantsService } from './tenants.service';
import { Tenant } from '../../common/decorators/tenant.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { SkipTenant } from '../../common/decorators/skip-tenant.decorator';

@ApiTags('tenants')
@ApiBearerAuth()
@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get()
  @Roles('SUPER_ADMIN')
  @SkipTenant()
  @ApiOperation({ summary: 'Listar todos os tenants (super admin)' })
  findAll(@Query() query: any) {
    return this.tenantsService.findAll(query);
  }

  @Get('settings')
  @ApiOperation({ summary: 'Obter configurações do tenant' })
  getSettings(@Tenant() tenantId: string) {
    return this.tenantsService.getSettings(tenantId);
  }

  @Put('settings')
  @Roles('OWNER', 'MANAGER')
  @ApiOperation({ summary: 'Atualizar configurações do tenant' })
  updateSettings(@Tenant() tenantId: string, @Body() settings: any) {
    return this.tenantsService.updateSettings(tenantId, settings);
  }

  @Get(':id')
  @Roles('SUPER_ADMIN')
  @SkipTenant()
  @ApiOperation({ summary: 'Obter tenant por ID (super admin)' })
  findOne(@Param('id') id: string) {
    return this.tenantsService.findOne(id);
  }
}
