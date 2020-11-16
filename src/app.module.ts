import { Module } from '@nestjs/common';
import { AccountsModule } from './accounts/accounts.module';
import { UserModule } from './user/user.module';
import { SharedModule } from './shared/shared.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from './shared/config.service';
import { OrganizationModule } from './organization/organization.module';
import { RegistrationModule } from './registration/registration.module';

@Module({
  imports: [
    // Global
    SharedModule,
    TypeOrmModule.forRootAsync({
      imports: [ SharedModule ],
      inject: [ ConfigService ],
      useFactory: (config: ConfigService) => {
        const ssl = config.get('USE_SSL') === 'true'
          ? { rejectUnauthorized: false }
          : false;

        const url = config.get('PG_URL') ?? '';

        return {
          type: 'postgres',
          entities: [ __dirname + '/**/**.model{.ts,.js}' ],
          url, ssl,
          extra: { max: 5 },
        };
      },
    }),

    // Features
    AccountsModule,
    UserModule,
    OrganizationModule,
    RegistrationModule,
  ],
})
export class AppModule {}
