import { Repository } from 'typeorm';
import { DatabaseProvider, ProvideModels } from '../provider';
import { UserConfirmationModel } from '@app/user/models/user-confirmation.model';

/**
 * Interface to customize creation of user accounts
 */
export interface IOneUser {
  email: string;
  id: string;
}

/**
 * Provide the ability to interact with the DB on behalf of `auth.users`
 */
@ProvideModels(UserConfirmationModel)
export class UserConfirmationProvider extends DatabaseProvider<UserConfirmationModel> { 

  public get repo(): Repository<UserConfirmationModel> {
    return this.db.repo(UserConfirmationModel);
  }

  public async createOne({ email, id }: IOneUser): Promise<UserConfirmationModel> {
    const creation = { userId: id, email };
    const model = this.repo.create(creation);
    await this.repo.createQueryBuilder()
      .insert()
      .values(model)
      .returning('*')
      .execute();

    return model;
  }

  public async createMany(data: IOneUser[]): Promise<UserConfirmationModel[]> {
    const models = data.map(({ email, id }) => this.repo.create({ userId: id, email }));
    await this.repo
      .createQueryBuilder()
      .insert()
      .values(models)
      .returning('*')
      .execute();
    
    return models;
  }
}

