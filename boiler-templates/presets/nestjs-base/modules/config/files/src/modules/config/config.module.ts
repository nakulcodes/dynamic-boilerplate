import { Global, Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { TypedConfigService } from './config.service';
import { configFactory } from './config.factory';

@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      expandVariables: true,
      load: [() => ({ validatedConfig: configFactory() })],
      validate: (config) => {
        // Additional validation can be added here if needed
        return config;
      },
    }),
  ],
  providers: [TypedConfigService],
  exports: [TypedConfigService, NestConfigModule],
})
export class ConfigModule {}