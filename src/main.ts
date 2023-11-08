import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConsoleLoggerOptions, ValidationPipe } from '@nestjs/common';
import { AppLogger } from './logger/logger.service';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  const configService = app.get<ConfigService>(ConfigService);
  const loggerOptions: ConsoleLoggerOptions =
    configService.get('LOG_LEVEL') === 'DEBUG'
      ? { logLevels: ['log', 'error', 'debug'] }
      : { logLevels: ['log', 'error'] };
  app.useLogger(new AppLogger('', loggerOptions));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );
  await app.listen(3000);
}
bootstrap();
