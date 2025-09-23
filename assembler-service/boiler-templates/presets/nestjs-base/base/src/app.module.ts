import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggingModule } from './common/logging/logging.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { configuration } from './config/configuration';
// MODULE_IMPORTS_PLACEHOLDER

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    LoggingModule,
    // MODULE_REGISTER_PLACEHOLDER
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}