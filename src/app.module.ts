import { Module } from '@nestjs/common';
import { AccountsModule } from './accounts/accounts.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [AccountsModule, UserModule],
})
export class AppModule {}
