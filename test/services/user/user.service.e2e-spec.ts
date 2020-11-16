import { TestingModule, Test } from '@nestjs/testing';
import { AppModule } from '@app/app.module';
import { UserService } from '@app/user/user.service';
import { setupDefaultApp } from '@app/app';
import { INestApplication, NotFoundException, ConflictException } from '@nestjs/common';
import { UserModel } from '@app/user/models/user.model';
import { CreateUser } from '@app/user/types/create-user';
import { Database } from '@test/database';
import { UserProvider } from '@test/database/providers/user.provider';
import { UserConfirmationProvider } from '@test/database/providers/user-confirmation.provider';
import { UserConfirmationModel } from '@app/user/models/user-confirmation.model';

describe('UserModule -- UserService', () => {
  let app: INestApplication;
  let service: UserService;
  let database: Database;

  let userProvider: UserProvider;
  let confirmProvider: UserConfirmationProvider;

  beforeAll(async () => {
    database = new Database(UserProvider, UserConfirmationProvider);
    await database.connect('UserService E2E Tests');

    userProvider = database.getProvider(UserProvider);
    confirmProvider = database.getProvider(UserConfirmationProvider);
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

  describe('#createConfirmation', () => {
    let user: UserModel;
    let email: string

    beforeEach(async () => {
      await userProvider.delete({ email });
    });

    beforeEach(async () => {
      email = 'user_service_create_confirmation@e2e-tests.example.com'
      user = await userProvider.createOne({ email })
    });

    afterEach(async () => {
      await userProvider.delete({ email });
      await confirmProvider.delete({ userId: user.id });
    });

    it('should create the confirmation for the right user', async () => {
      const conf = await service.createConfirmation(user);
      expect(conf.userId).toEqual(user.id);
      expect(conf.email).toEqual(user.email);
      expect(conf.token).toHaveLength(32);
      expect(conf.confirmedAt).toBeFalsy();
    });
  });

  describe('#confirmRegistration', () => {
    let user: UserModel;
    let email: string;
    let conf: UserConfirmationModel;

    beforeEach(async () => {
      await userProvider.delete({ email });
    });

    beforeEach(async () => {
      email = 'user_service_confirm_registration@e2e-tests.example.com'
      user = await userProvider.createOne({ email })
      conf = await confirmProvider.createOne(user);
    });

    afterEach(async () => {
      await userProvider.delete({ email });
      await confirmProvider.delete({ userId: user.id });
    });

    it('throws 409 on already confirmed token', async () => {
      await confirmProvider.repo.update({ token: conf.token}, { confirmedAt: new Date() })

      try {
        await service.confirmRegistration(conf.token);
        throw new Error('Expected a 409, got no error')
      } catch (err) {
        expect(err).toBeInstanceOf(ConflictException);
      }
    });

    it('throws 404 on no token match', async () => {
      await confirmProvider.delete({ token: conf.token });
      try {
        await service.confirmRegistration(conf.token);
        throw new Error('Expected a 404, got no error')
      } catch (err) {
        expect(err).toBeInstanceOf(NotFoundException);
      }
    });

    it('updates the user\'s confirmedAt', async () => {
      const now = Date.now() - 5;
      await service.confirmRegistration(conf.token);

      const latestUser = await userProvider.repo.findOne(user.id);
      expect(latestUser).toBeTruthy();
      expect(latestUser?.confirmedAt).toBeDefined();
      expect(latestUser?.confirmedAt?.getTime()).toBeGreaterThan(now);
    });

    it('updates the confirmation\'s confirmedAt', async () => {
      const now = Date.now() - 5;
      await service.confirmRegistration(conf.token);

      const latestConf = await confirmProvider.repo.findOne({ where: { token: conf.token } });
      expect(latestConf).toBeTruthy();
      expect(latestConf?.confirmedAt).toBeDefined();
      expect(latestConf?.confirmedAt?.getTime()).toBeGreaterThan(now);
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

