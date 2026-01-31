import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PublicService } from './public.service';
import { Public } from '../../common/decorators/public.decorator';
import { Throttle } from '@nestjs/throttler';

@ApiTags('public')
@Controller('public')
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  @Get(':tenantSlug/config')
  @Public()
  getLandingConfig(@Param('tenantSlug') tenantSlug: string) {
    return this.publicService.getLandingConfig(tenantSlug);
  }

  @Get(':tenantSlug/services')
  @Public()
  getPublicServices(@Param('tenantSlug') tenantSlug: string) {
    return this.publicService.getPublicServices(tenantSlug);
  }

  @Post(':tenantSlug/quote')
  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  submitQuote(@Param('tenantSlug') tenantSlug: string, @Body() data: any) {
    return this.publicService.submitQuote(tenantSlug, data);
  }

  @Post(':tenantSlug/quote/estimate')
  @Public()
  getQuoteEstimate(@Param('tenantSlug') tenantSlug: string, @Body() body: { serviceIds: string[] }) {
    return this.publicService.getQuoteEstimate(tenantSlug, body.serviceIds);
  }
}
