import { Module } from '@nestjs/common';
import { AnomalyController } from './anomaly.controller';
import { AnomalyService } from './anomaly.service';

@Module({
  imports: [],
  controllers: [AnomalyController],
  providers: [AnomalyService],
})
export class AnomalyModule {}
