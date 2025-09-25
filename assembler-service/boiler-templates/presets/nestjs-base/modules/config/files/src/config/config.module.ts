import { Global, Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { AppConfigService } from './config.service';
import { configuration } from './configuration';

@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: ['.env.local', '.env'],
      expandVariables: true,
    }),
  ],
  providers: [AppConfigService],
  exports: [AppConfigService, NestConfigModule],
})
export class AppConfigModule {}