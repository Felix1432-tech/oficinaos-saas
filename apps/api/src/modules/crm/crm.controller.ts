import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CrmService } from './crm.service';
import { Tenant } from '../../common/decorators/tenant.decorator';
import { CurrentUser, CurrentUserData } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  CreateStageDto,
  UpdateStageDto,
  ReorderStagesDto,
  CreateCardDto,
  UpdateCardDto,
  MoveCardDto,
  CardQueryDto,
} from './dto/crm.dto';

@ApiTags('crm')
@ApiBearerAuth()
@Controller('crm')
export class CrmController {
  constructor(private readonly crmService: CrmService) {}

  // ============ STAGES ============

  @Get('stages')
  @ApiOperation({ summary: 'Listar estágios do pipeline' })
  async getStages(@Tenant() tenantId: string) {
    return this.crmService.getStages(tenantId);
  }

  @Post('stages')
  @Roles('OWNER', 'MANAGER')
  @ApiOperation({ summary: 'Criar novo estágio' })
  async createStage(
    @Tenant() tenantId: string,
    @Body() dto: CreateStageDto,
  ) {
    return this.crmService.createStage(tenantId, dto);
  }

  @Put('stages/:id')
  @Roles('OWNER', 'MANAGER')
  @ApiOperation({ summary: 'Atualizar estágio' })
  async updateStage(
    @Tenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateStageDto,
  ) {
    return this.crmService.updateStage(tenantId, id, dto);
  }

  @Delete('stages/:id')
  @Roles('OWNER', 'MANAGER')
  @ApiOperation({ summary: 'Excluir estágio' })
  async deleteStage(
    @Tenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.crmService.deleteStage(tenantId, id);
  }

  @Put('stages/reorder')
  @Roles('OWNER', 'MANAGER')
  @ApiOperation({ summary: 'Reordenar estágios' })
  async reorderStages(
    @Tenant() tenantId: string,
    @Body() dto: ReorderStagesDto,
  ) {
    return this.crmService.reorderStages(tenantId, dto.stages);
  }

  // ============ KANBAN ============

  @Get('kanban')
  @ApiOperation({ summary: 'Obter board Kanban completo' })
  async getKanban(@Tenant() tenantId: string) {
    return this.crmService.getKanban(tenantId);
  }

  // ============ CARDS ============

  @Get('cards')
  @ApiOperation({ summary: 'Listar cards com filtros' })
  async getCards(
    @Tenant() tenantId: string,
    @Query() query: CardQueryDto,
  ) {
    return this.crmService.getCards(tenantId, query);
  }

  @Get('cards/:id')
  @ApiOperation({ summary: 'Obter detalhes do card' })
  async getCard(
    @Tenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.crmService.getCard(tenantId, id);
  }

  @Post('cards')
  @ApiOperation({ summary: 'Criar novo card' })
  async createCard(
    @Tenant() tenantId: string,
    @CurrentUser() user: CurrentUserData,
    @Body() dto: CreateCardDto,
  ) {
    return this.crmService.createCard(tenantId, user.id, dto);
  }

  @Put('cards/:id')
  @ApiOperation({ summary: 'Atualizar card' })
  async updateCard(
    @Tenant() tenantId: string,
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
    @Body() dto: UpdateCardDto,
  ) {
    return this.crmService.updateCard(tenantId, user.id, id, dto);
  }

  @Put('cards/:id/move')
  @ApiOperation({ summary: 'Mover card para outro estágio/posição' })
  async moveCard(
    @Tenant() tenantId: string,
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
    @Body() dto: MoveCardDto,
  ) {
    return this.crmService.moveCard(tenantId, user.id, id, dto);
  }

  @Delete('cards/:id')
  @ApiOperation({ summary: 'Excluir card (soft delete)' })
  async deleteCard(
    @Tenant() tenantId: string,
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
  ) {
    return this.crmService.deleteCard(tenantId, user.id, id);
  }

  @Get('cards/:id/timeline')
  @ApiOperation({ summary: 'Obter timeline do card' })
  async getCardTimeline(
    @Tenant() tenantId: string,
    @Param('id') id: string,
    @Query() query: any,
  ) {
    return this.crmService.getCardTimeline(tenantId, id, query);
  }
}
