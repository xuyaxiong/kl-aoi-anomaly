import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as fs from 'fs';
import { spawn } from 'child_process';
const path = require('path');
import { LoggingInterceptor } from './interceptor/logging.interceptor';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import AppConfig from './app.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalInterceptors(new LoggingInterceptor());
  swaggerDoc(app);
  dllDump(process.pid);
  await app.listen(process.env.PORT ?? 3200);
}

bootstrap();

function swaggerDoc(app) {
  const config = new DocumentBuilder()
    .setTitle('AOI Anomaly')
    .setDescription('AOI Anomaly')
    .setVersion('1.0')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);
}

function dllDump(port: number) {
  const crashDir = AppConfig.CRASH_DUMP_DIR;
  fs.mkdirSync(crashDir, { recursive: true });
  const crashPath = path.join(crashDir, `${Date.now()}.dmp`);
  let procdumpPath = path.join(__dirname, 'procdump.exe');
  const procdump = spawn(procdumpPath, [
    '-accepteula',
    '-e',
    '-mm',
    String(port),
    crashPath,
  ]);
  procdump.stdout.on('data', (data) => {});

  procdump.stderr.on('data', (data) => {
    console.error('procdump_stderr', data.toString());
  });

  procdump.on('exit', (code) => {
    console.log('procdump_exit', `Child exited with code ${code}`);
  });
}
