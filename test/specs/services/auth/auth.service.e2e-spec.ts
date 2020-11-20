import crypto from 'crypto'

import jwtVerify from 'jose/jwt/verify';

import { TestingModule, Test } from '@nestjs/testing';
import { AppModule } from '@app/app.module';
import { setupDefaultApp } from '@app/app';
import { INestApplication } from '@nestjs/common';
import { Database } from '@test/database';
import { KeyObject } from 'crypto';
import { PRIVATE_KEY, PUBLIC_KEY } from '@app/auth/auth.constants';
import { OrganizationModel } from '@app/organization/models/organization.model';
import { UserModel } from '@app/user/models/user.model';
import { UserProvider } from '@test/database/providers/user.provider';
import { OrganizationProvider } from '@test/database/providers/organization.provider';
import { OrganizationUserProvider } from '@test/database/providers/organization-user.provider';
import { AuthService } from '@app/auth/auth.service';

const moduleName = 'Auth'
const serviceName = 'Auth'

const rsaOpts: crypto.RSAKeyPairOptions<'pem', 'pem'> = {
  modulusLength: 4096,
  privateKeyEncoding: { type: 'pkcs1', format: 'pem' },
  publicKeyEncoding: { type: 'pkcs1', format: 'pem' },
}

interface IKeyPair {
  pub: KeyObject;
  prv: KeyObject;
}

function createPair(): Promise<IKeyPair> {
  return new Promise((resolve, reject) => {
    crypto.generateKeyPair('rsa', rsaOpts, (err, pub: string, prv: string) => {
      if (err) return reject(err);

      const pubKey = crypto.createPublicKey(pub)
      const priKey = crypto.createPrivateKey(prv);

      resolve({ pub: pubKey, prv: priKey });
    });
  })
}

describe(`${moduleName}Module -- ${serviceName}Service`, () => {
  const testName = `${moduleName}#${serviceName}`;
  let app: INestApplication;
  let database: Database;
  let service: AuthService;
  let keys: IKeyPair;

  let userProvider: UserProvider;
  let orgProvider: OrganizationProvider;
  let orgUserProvider: OrganizationUserProvider;

  beforeAll(async () => {
    keys = await createPair();

    database = new Database(UserProvider, OrganizationProvider, OrganizationUserProvider);
    await database.connect(testName);

    userProvider = database.getProvider(UserProvider);
    orgProvider = database.getProvider(OrganizationProvider);
    orgUserProvider = database.getProvider(OrganizationUserProvider);
  });

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test
      .createTestingModule({ imports: [AppModule] })
      .overrideProvider(PRIVATE_KEY).useValue(keys.prv)
      .overrideProvider(PUBLIC_KEY).useValue(keys.pub)
      .compile();

    app = moduleFixture.createNestApplication();
    setupDefaultApp(app);

    await app.init();

    service = app.get(AuthService);
  });

  afterEach(async () => {
    await app.close();
  });

  afterAll(async () => {
    await database.disconnect();
  });

  it('#test - Initializes Properly', () => {
    expect(database).toBeDefined();
  });


  describe('#createAccess', () => {

    let user: UserModel;
    let org: OrganizationModel;
    let email: string;

    beforeEach(async () => {
      email = 'auth_service_create_access@e2e-tests.example.com';
      user = await userProvider.createOne({ email });
      org = await orgProvider.createOne({ creatorId: user.id });
      await orgUserProvider.createOne({ orgId: org.id, role: 'owner', userId: user.id });
    });

    afterEach(async () => {
      await userProvider.delete({ email });
    });

    // if this does not error, it passes because it works
    it('creates a token with access to the user\'s org', async () => {
      const token = await service.createAccess(user);
      await jwtVerify(token, keys.pub, {
        issuer: 'auth-example',
        audience: [ `${org.id}:owner` ],
        subject: user.id,
      });
    });
  });

  describe('#createRefresh', () => {
    it('inserts the refresh tokens into the db');
    it('returns a proper refresh token');
  });
});
