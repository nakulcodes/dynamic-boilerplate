import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AssemblerService } from './assembler.service';
import { AssemblerController } from './assembler.controller';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [ConfigModule, StorageModule],
  controllers: [AssemblerController],
  providers: [AssemblerService],
  exports: [AssemblerService],
})
export class AssemblerModule {}