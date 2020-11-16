import { TestingModule, Test } from '@nestjs/testing';
import { AppModule } from '@app/app.module';
import { UserService } from '@app/user/user.service';
import { setupDefaultApp } from '@app/app';
import { INestApplication } from '@nestjs/common';
import { UserModel } from '@app/user/user.model';
import { CreateUser } from '@app/user/types/create-user';
import { Database } from '@test/database';
import { UserProvider } from '@test/database/providers/user.provider';

describe('UserModule -- UserService', () => {
  let app: INestApplication;
  let service: UserService;
  let database: Database;
  let userProvider: UserProvider;

  beforeAll(async () => {
    database = new Database(UserProvider);
    await database.connect('UserService E2E Tests');

    userProvider = database.getProvider(UserProvider);
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
    await database.disconnect();
  })

  describe('#createUser', () => {
    let dto: CreateUser;

    beforeEach(() => {
      dto = new CreateUser();
      dto.email = 'create_user@user_service_e2e.example.com';
      dto.password = 'Password1234!';
    });

    afterEach(async () => {
      await userProvider.delete({ email: dto.email });
    });

    it('should be able to create user', async () => {
      const creation = await service.createUser(dto);
      expect(creation).toBeDefined();
    });

    it('should hash the password automatically', async () => {
      await service.createUser(dto);
      const record = await userProvider.repo
        .createQueryBuilder('user')
        .where('user.email = :email', { email: dto.email })
        .getOne();

      expect(record).toBeDefined();
      expect(record?.password).not.toEqual(dto.password);
    });
  });

  describe('#getUser', () => {
    let user: UserModel;
    let email: string;

    beforeEach(async () => {
      email = 'get_user@e2e_tests.example.com';
      user = await userProvider.createOne({ email });
    });

    afterEach(async () => {
      await userProvider.delete({ email })
    });

    it('should get the right user', async () => {
      const result = await service.getUser({ email })
      expect(result).toEqual(user);
    });
  });
});

