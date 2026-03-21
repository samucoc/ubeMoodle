import { Module, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Role])],
  controllers: [RolesController],
  providers: [RolesService],
  exports: [RolesService],
})
export class RolesModule implements OnApplicationBootstrap {
  private readonly logger = new Logger(RolesModule.name);

  constructor(private readonly rolesService: RolesService) {}

  async onApplicationBootstrap() {
    await this.rolesService.seedDefaultRoles();
    this.logger.log('Default roles seeded');
  }
}
