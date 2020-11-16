import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserModel } from './models/user.model';
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserConfirmationModel } from './models/user-confirmation.model';

// declare the models once so they can be shared in the situation
// that other modules require specific functionality but have no
// specific use for the services that this module supplies
const models = TypeOrmModule.forFeature([ UserModel, UserConfirmationModel ])

@Module({
  imports: [ models ],
  exports: [ models, UserService ],
  providers: [ UserService ]
})
export class UserModule {}
