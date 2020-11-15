import Knex from 'knex';

import * as database from '@test/utilities/database';

import { TestingModule, Test } from '@nestjs/testing';
import { AppModule } from '@app/app.module';
import { UserService } from '@app/user/user.service';
import { setupDefaultApp } from '@app/app';
import { INestApplication } from '@nestjs/common';
import { CreateUser } from '@app/user/types/create-user';
import { UserModel } from '@app/user/user.model';
import { plainToClass } from 'class-transformer';

describe('UserModule -- UserService', () => {
  let app: INestApplication;
  let service: UserService;
  let db: Knex;

  beforeAll(async () => {
    db = database.getKnexClient();
  });

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test
      .createTestingModule({ imports: [AppModule] })
      .compile();

    app = moduleFixture.createNestApplication();
    app.init();
    setupDefaultApp(app);

    service = moduleFixture.get(UserService);
  });

  afterEach(async () => {
    await app.close();
  });

  afterAll(async () => {
    await db.destroy();
  });

  describe('#createUser', () => {
    let dto: CreateUser;

    beforeEach(() => {
      dto = new CreateUser();
      dto.email = 'create_user@user_service_e2e.example.com';
      dto.password = 'Password1234!';
    });

    afterEach(async () => {
      await db.queryBuilder()
        .table('auth.users')
        .where('email', dto.email)
        .del();
    });

    it('should be able to create user', async () => {
      const creation = await service.createUser(dto);
      expect(creation).toBeDefined();
    });

    it('should hash the password automatically', async () => {
      await service.createUser(dto);
      const record = await database
        .getTable('auth.users', db)
        .where({ email: dto.email })
        .select('*')
        .first();

      expect(record.password).not.toEqual(dto.password);
    });
  });

  describe('#getUser', () => {
    // snake_case user
    let user: UserModel;
    let email: string;

    beforeEach(async () => {
      email = 'get_user@e2e_tests.example.com';

      const created = await db.table('auth.users')
        .insert({ email })
        .returning('*')

      const id = created[0].id;
      const { created_at, updated_at, confirmed_at, ... data }= await db.table('auth.users')
        .where({ id })
        .select(
          '*',
          'created_at as createdAt',
          'updated_at as updatedAt',
          'confirmed_at as confirmedAt',
        )
        .first();

      user = plainToClass(UserModel, data);
    });

    afterEach(async () => {
      await db.table('auth.users')
        .where({ email })
        .del();
    });

    it('should get the right user', async () => {
      const result = await service.getUser({ email })
      expect(result).toEqual(user);
    });
  });
});

