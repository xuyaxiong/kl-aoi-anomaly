import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import localConfig from './config/local.config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AnomalyController } from './anomaly/anomaly.controller';
import { AnomalyService } from './anomaly/anomaly.service';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true, load: [localConfig] })],
  controllers: [AppController, AnomalyController],
  providers: [AppService, AnomalyService],
})
export class AppModule {}
