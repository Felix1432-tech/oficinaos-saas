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
import { VehiclesService } from './vehicles.service';
import { Tenant } from '../../common/decorators/tenant.decorator';

@ApiTags('vehicles')
@ApiBearerAuth()
@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar veículos' })
  findAll(@Tenant() tenantId: string, @Query() query: any) {
    return this.vehiclesService.findAll(tenantId, query);
  }

  @Get('plate/:plate')
  @ApiOperation({ summary: 'Buscar veículo por placa' })
  findByPlate(@Tenant() tenantId: string, @Param('plate') plate: string) {
    return this.vehiclesService.findByPlate(tenantId, plate);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter veículo por ID' })
  findOne(@Tenant() tenantId: string, @Param('id') id: string) {
    return this.vehiclesService.findOne(tenantId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Criar veículo' })
  create(@Tenant() tenantId: string, @Body() data: any) {
    return this.vehiclesService.create(tenantId, data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar veículo' })
  update(
    @Tenant() tenantId: string,
    @Param('id') id: string,
    @Body() data: any,
  ) {
    return this.vehiclesService.update(tenantId, id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir veículo' })
  remove(@Tenant() tenantId: string, @Param('id') id: string) {
    return this.vehiclesService.remove(tenantId, id);
  }
}
