import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProposalsService } from './proposals.service';
import { Tenant } from '../../common/decorators/tenant.decorator';
import { CurrentUser, CurrentUserData } from '../../common/decorators/current-user.decorator';

@ApiTags('proposals')
@ApiBearerAuth()
@Controller('proposals')
export class ProposalsController {
  constructor(private readonly proposalsService: ProposalsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar orçamentos' })
  findAll(@Tenant() tenantId: string, @Query() query: any) {
    return this.proposalsService.findAll(tenantId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter orçamento por ID' })
  findOne(@Tenant() tenantId: string, @Param('id') id: string) {
    return this.proposalsService.findOne(tenantId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Criar orçamento' })
  create(@Tenant() tenantId: string, @CurrentUser() user: CurrentUserData, @Body() data: any) {
    return this.proposalsService.create(tenantId, user.id, data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar orçamento' })
  update(@Tenant() tenantId: string, @CurrentUser() user: CurrentUserData, @Param('id') id: string, @Body() data: any) {
    return this.proposalsService.update(tenantId, user.id, id, data);
  }

  @Post(':id/items')
  @ApiOperation({ summary: 'Adicionar item ao orçamento' })
  addItem(@Tenant() tenantId: string, @Param('id') id: string, @Body() item: any) {
    return this.proposalsService.addItem(tenantId, id, item);
  }

  @Delete(':id/items/:itemId')
  @ApiOperation({ summary: 'Remover item do orçamento' })
  removeItem(@Tenant() tenantId: string, @Param('id') id: string, @Param('itemId') itemId: string) {
    return this.proposalsService.removeItem(tenantId, id, itemId);
  }

  @Post(':id/send')
  @ApiOperation({ summary: 'Enviar orçamento' })
  send(@Tenant() tenantId: string, @CurrentUser() user: CurrentUserData, @Param('id') id: string, @Body() data: any) {
    return this.proposalsService.send(tenantId, user.id, id, data);
  }

  @Post(':id/approve')
  @ApiOperation({ summary: 'Aprovar orçamento' })
  approve(@Tenant() tenantId: string, @CurrentUser() user: CurrentUserData, @Param('id') id: string) {
    return this.proposalsService.approve(tenantId, user.id, id);
  }

  @Get(':id/pdf')
  @ApiOperation({ summary: 'Gerar PDF do orçamento' })
  generatePdf(@Tenant() tenantId: string, @Param('id') id: string) {
    // TODO: Implement PDF generation
    return { message: 'PDF generation not implemented yet' };
  }
}
