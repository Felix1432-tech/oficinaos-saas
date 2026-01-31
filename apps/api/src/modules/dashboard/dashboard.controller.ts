import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { Tenant } from '../../common/decorators/tenant.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { SkipTenant } from '../../common/decorators/skip-tenant.decorator';

@ApiTags('dashboard')
@ApiBearerAuth()
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('overview')
  getOverview(@Tenant() tenantId: string) {
    return this.dashboardService.getOverview(tenantId);
  }

  @Get('stages')
  getStageMetrics(@Tenant() tenantId: string) {
    return this.dashboardService.getStageMetrics(tenantId);
  }

  @Get('leads-by-channel')
  getLeadsByChannel(@Tenant() tenantId: string) {
    return this.dashboardService.getLeadsByChannel(tenantId);
  }

  @Get('recent-activity')
  getRecentActivity(@Tenant() tenantId: string, @Query('limit') limit?: number) {
    return this.dashboardService.getRecentActivity(tenantId, limit);
  }

  @Get('superadmin')
  @Roles('SUPER_ADMIN')
  @SkipTenant()
  getSuperAdminOverview() {
    return this.dashboardService.getSuperAdminOverview();
  }
}
