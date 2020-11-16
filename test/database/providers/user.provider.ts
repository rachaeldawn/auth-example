import bcrypt from 'bcrypt';

import { UserModel } from '@app/user/models/user.model';
import { Repository } from 'typeorm';
import { hashRounds } from '@app/user/user.constants';
import { defaultPassword } from '@test/utilities/constants';
import { DatabaseProvider, ProvideModels } from '../provider';

/**
 * Interface to customize creation of user accounts
 */
export interface IOneUser {
  email: string;
  name?: string;
  confirmedAt?: Date;
  age?: number;
  password?: string;
}

/**
 * Provide the ability to interact with the DB on behalf of `auth.users`
 */
@ProvideModels(UserModel)
export class UserProvider extends DatabaseProvider<UserModel> { 

  public get repo(): Repository<UserModel> {
    return this.db.repo(UserModel);
  }

  // hash passwords, not exporting because not helpful anywhere else
  private hash(arg: string): Promise<string> {
    return bcrypt.hash(arg, hashRounds);
  }

  public async createOne(data: IOneUser): Promise<UserModel> {
    const password = await this.hash(data.password != null ? data.password : defaultPassword);

    const model: UserModel = this.repo.create({ ... data, password });
    await this.repo.createQueryBuilder()
      .insert()
      .values(model)
      .returning('*')
      .execute();

    return model;
  }

  public async createMany(data: IOneUser[]): Promise<UserModel[]> {
    const hashings: Promise<void>[] =
      data.map(a => this.hash(a.password ?? defaultPassword).then(pwd => { a.password = pwd }));

    await Promise.all(hashings);

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

