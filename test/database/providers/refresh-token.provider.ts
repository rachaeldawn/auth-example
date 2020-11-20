import { Repository } from 'typeorm';
import { DatabaseProvider, ProvideModels } from '../provider';
import { RefreshTokenModel } from '@app/auth/models/refresh-token.model';

/**
 * Interface to customize creation of user accounts
 */
export interface IOneToken {
  expiresAt: Date;
  userId: string;
}

/**
 * Provide the ability to interact with the DB on behalf of `auth.users`
 */
@ProvideModels(RefreshTokenModel)
export class RefreshTokenProvider extends DatabaseProvider<RefreshTokenModel> { 

  public get repo(): Repository<RefreshTokenModel> {
    return this.db.repo(RefreshTokenModel);
  }

  public async createOne(token: IOneToken): Promise<RefreshTokenModel> {
    const model = this.repo.create(token);
    await this.repo
      .createQueryBuilder()
      .insert()
      .values(model)
      .returning('*')
      .execute();
    
    return model;
  }

  public async createMany(data: IOneToken[]): Promise<RefreshTokenModel[]> {
    const models = data.map(a => this.repo.create(a));
    await this.repo
      .createQueryBuilder()
      .insert()
      .values(models)
      .returning('*')
      .execute();
    
    return models;
  }
}

