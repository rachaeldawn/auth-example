import { Module } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizationModel } from './models/organization.model';
import { OrganizationUserModel } from './models/organization-user.model';

const models = TypeOrmModule.forFeature([
  OrganizationModel,
  OrganizationUserModel,
])

@Module({
  imports: [ models ],
  exports: [ models ],
  providers: [ OrganizationService ],
})
export class OrganizationModule {}
