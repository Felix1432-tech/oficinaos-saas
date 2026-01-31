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
import { CustomersService } from './customers.service';
import { Tenant } from '../../common/decorators/tenant.decorator';

@ApiTags('customers')
@ApiBearerAuth()
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  @ApiOperation({ summary: 'Listar clientes' })
  findAll(@Tenant() tenantId: string, @Query() query: any) {
    return this.customersService.findAll(tenantId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter cliente por ID' })
  findOne(@Tenant() tenantId: string, @Param('id') id: string) {
    return this.customersService.findOne(tenantId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Criar cliente' })
  create(@Tenant() tenantId: string, @Body() data: any) {
    return this.customersService.create(tenantId, data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar cliente' })
  update(
    @Tenant() tenantId: string,
    @Param('id') id: string,
    @Body() data: any,
  ) {
    return this.customersService.update(tenantId, id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir cliente' })
  remove(@Tenant() tenantId: string, @Param('id') id: string) {
    return this.customersService.remove(tenantId, id);
  }

  @Get(':id/history')
  @ApiOperation({ summary: 'Histórico do cliente' })
  getHistory(@Tenant() tenantId: string, @Param('id') id: string) {
    return this.customersService.getHistory(tenantId, id);
  }
}
