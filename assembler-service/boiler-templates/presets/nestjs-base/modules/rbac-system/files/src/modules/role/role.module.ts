import { Module } from '@nestjs/common';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { RoleRepository } from '../../database/repositories/role.repository';

@Module({
  controllers: [RoleController],
  providers: [RoleRepository, RoleService],
  exports: [RoleService],
})
export class RoleModule {}