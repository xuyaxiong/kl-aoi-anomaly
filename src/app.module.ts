import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import localConfig from './config/local.config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AnomalyController } from './anomaly/anomaly.controller';
import { AnomalyService } from './anomaly/anomaly.service';
import { AOIDBModule } from '@koala123/aoi-db';
import AppConfig from './app.config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [localConfig] }),
    AOIDBModule.forRoot({
      width: AppConfig.imgInfo.width,
      height: AppConfig.imgInfo.height,
      channel: AppConfig.imgInfo.channel,
      dbPath: AppConfig.exportPath.dbPath,
      dllPath: AppConfig.DLL_PATH,
    }),
  ],
  controllers: [AppController, AnomalyController],
  providers: [AppService, AnomalyService],
})
export class AppModule {}
