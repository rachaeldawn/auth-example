import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { privateKeyProvider, publicKeyProvider } from './signing-keys';
import { OrganizationModule } from '@app/organization/organization.module';
import { UserModule } from '@app/user/user.module';
import { SharedModule } from '@app/shared/shared.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshTokenModel } from './models/refresh-token.model';

const models = TypeOrmModule.forFeature([ RefreshTokenModel ]);

@Module({
  imports: [ models, UserModule, OrganizationModule, SharedModule ],
  exports: [ models, AuthService ],
  providers: [ AuthService, publicKeyProvider, privateKeyProvider ],
})
export class AuthModule {}
