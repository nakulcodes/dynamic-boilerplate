import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AssemblerModule } from './assembler/assembler.module';
import { StorageModule } from './storage/storage.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    AssemblerModule,
    StorageModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}