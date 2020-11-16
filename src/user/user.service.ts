import bcrypt from 'bcrypt';

import * as constants from './user.constants';

import { Injectable } from '@nestjs/common';
import { CreateUser } from './types/create-user';
import { UserModel } from './models/user.model';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IGetUser } from './types/get-user';

@Injectable()
export class UserService {

  constructor(
    @InjectRepository(UserModel)
    private userRepo: Repository<UserModel>
  ) {}

  /**
   * Given a password while registering a user, hash it using bcrypt to return a secure version
   * for saving in the database
   */
  public async createPassword(arg: string): Promise<string> {
    return bcrypt.hash(arg, constants.hashRounds)
  }


  /**
   * Create a new user in the database
   */
  public async createUser(create: CreateUser): Promise<UserModel> {
    const password = await this.createPassword(create.password);
    const data = this.userRepo.create({ ... create, password})

    await this.userRepo.createQueryBuilder()
      .insert()
      .values(data)
      .returning('*')
      .execute()

    return data;
  }

  /**
   * Get a user by uniquely identifiable information (id or email)
   */
  public async getUser({ id, email }: IGetUser): Promise<UserModel | undefined> {
    const find: Partial<UserModel> = {};
    if (!!id) find.id = id;
    if (!!email) find.email = email;

    return this.userRepo.findOne(find);
  }
}
