import { Controller, Get, Post, Body } from '@nestjs/common';
import { AnomalyService } from './anomaly.service';
import { AnomalyParam } from './anomaly.param';
import HttpResponse from 'src/utils/api_res';

@Controller('anomaly')
export class AnomalyController {
  constructor(private readonly anomalyService: AnomalyService) {}

  @Post('anomaly')
  async anomaly(@Body() anomalyParam: AnomalyParam) {
    try {
      const res = await this.anomalyService.anomaly(anomalyParam);
      return HttpResponse.ok(res);
    } catch (error) {
      return HttpResponse.err(error.message);
    }
  }
}
