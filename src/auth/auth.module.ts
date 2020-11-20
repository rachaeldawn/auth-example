import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { privateKeyProvider, publicKeyProvider } from './signing-keys';
import { OrganizationModule } from '@app/organization/organization.module';
import { UserModule } from '@app/user/user.module';
import { SharedModule } from '@app/shared/shared.module';

@Module({
  imports: [ UserModule, OrganizationModule, SharedModule ],
  exports: [ AuthService ],
  providers: [
    AuthService,
    publicKeyProvider,
    privateKeyProvider,
  ]
})
export class AuthModule {}
