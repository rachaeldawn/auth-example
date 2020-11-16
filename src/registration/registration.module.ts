import { Module } from '@nestjs/common';
import { RegistrationController } from './registration.controller';
import { UserModule } from '@app/user/user.module';
import { OrganizationModule } from '@app/organization/organization.module';

@Module({
  imports: [UserModule, OrganizationModule],
  controllers: [RegistrationController]
})
export class RegistrationModule {}
