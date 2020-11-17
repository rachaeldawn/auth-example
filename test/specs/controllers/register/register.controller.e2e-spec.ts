import assert from 'assert';
import moment from 'moment';

import { TestingModule, Test } from '@nestjs/testing';
import { AppModule } from '@app/app.module';
import { setupDefaultApp } from '@app/app';
import { INestApplication, HttpStatus } from '@nestjs/common';
import { Database } from '@test/database';
import { UserProvider } from '@test/database/providers/user.provider';
import { UserConfirmationProvider } from '@test/database/providers/user-confirmation.provider';
import { defaultPassword } from '@test/utilities/constants';
import { default as supertest, Response } from 'supertest';

describe('RegisterModule -- RegistrationController', () => {
  let app: INestApplication;
  let database: Database;

  let userProvider: UserProvider;
  let confirmProvider: UserConfirmationProvider;

  const caller = () => supertest(app.getHttpServer());

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test
      .createTestingModule({ imports: [AppModule] })
      .compile();

    app = moduleFixture.createNestApplication();
    setupDefaultApp(app);

    await app.init();

    database = new Database(UserProvider, UserConfirmationProvider);
    await database.connect('RegisterModule:RegistrationController');

    userProvider = database.getProvider(UserProvider);
    confirmProvider = database.getProvider(UserConfirmationProvider);

  });

  afterAll(async () => {
    await app.close();
    await database.disconnect();
  });

  describe('registration', () => {

    let email: string;
    let password: string;

    beforeEach(() => {
      password = defaultPassword
      email = 'register_controller@e2e-tests.example.com';
    });

    afterEach(async () => {
      await userProvider.delete({ email });
    });

    it('allows you to register with a new email', async () => {
      await caller()
        .post('/register')
        .send({ email, password })
        .set('Content-Type', 'application/json')
        .expect(HttpStatus.CREATED)
        .expect((res: Response) => {
          const messageTest = /registration success/i;
          assert(messageTest.test(res.body?.message));
        });

      const record = await userProvider.repo.findOne({ email });
      expect(record).toBeTruthy();
      expect(record?.confirmedAt).toBeNull();
    });

    it('refuses existing emails that are confirmed', async () => {
      const user = await userProvider.createOne({
        confirmedAt: moment().add(5, 'minutes').toDate(),
        name: 'Register Existing Test',
        password,
        email,
      });
      const conf = await confirmProvider.createOne(user);
      await confirmProvider.repo.update({ id: conf.id }, { confirmedAt: user.confirmedAt });

      const pwd = 'SomeNewPassword';
      await caller()
        .post('/register')
        .send({ email, password: pwd })
        .set('Content-Type', 'application/json')
        .expect(HttpStatus.CONFLICT)
        .expect((res: Response) => {
          const msg = /already.*registered/i;
          assert(msg.test(res.body.message));
        });
    });

    it('allows re-register existing unconfirmed emails', async () => {
      const user = await userProvider.createOne({ email, password: defaultPassword });

      const pwd = 'SomeNewPassword';
      const call = { email, password: pwd, organization: 'Yeet Mageet' };

      await caller()
        .post('/register')
        .send(call)
        .set('Content-Type', 'application/json')
        .expect(HttpStatus.CREATED)
        .expect((res: Response) => {
          const msg = /registration updated/i;
          assert(msg.test(res.body.message));
        });

      const latestUser = await userProvider.repo.findOne(user.id);
      expect(latestUser).toBeDefined();
      expect(latestUser?.password).not.toEqual(user.password);
    });

  });

  describe('confirmation', () => {
    it.todo('allows you to confirm a valid token');
    it.todo('refuses already accepted tokens');
    it.todo('refuses invalid requests (missing token)');
    it.todo('refuses invalid requests (wrong length)');
  });
});

