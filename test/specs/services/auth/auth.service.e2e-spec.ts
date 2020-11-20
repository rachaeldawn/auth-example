import crypto from 'crypto'
import Moment from 'moment';
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
import { RefreshTokenProvider } from '@test/database/providers/refresh-token.provider';
import { JWTVerifyResult } from 'jose/webcrypto/types';

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
  let app: INestApplication;
  let database: Database;
  let service: AuthService;
  let keys: IKeyPair;

  let userProvider: UserProvider;
  let orgProvider: OrganizationProvider;
  let orgUserProvider: OrganizationUserProvider;
  let refreshProvider: RefreshTokenProvider;

  // common test data
  let user: UserModel;
  let org: OrganizationModel;
  let email: string;

  beforeAll(async () => {
    keys = await createPair();

    database = new Database(
      UserProvider,
      OrganizationProvider,
      OrganizationUserProvider,
      RefreshTokenProvider
    );

    await database.connect('AuthModule E2E AuthService');

    userProvider = database.getProvider(UserProvider);
    orgProvider = database.getProvider(OrganizationProvider);
    orgUserProvider = database.getProvider(OrganizationUserProvider);
    refreshProvider = database.getProvider(RefreshTokenProvider);
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

  beforeEach(async () => {
    email = 'auth_service_create_access@e2e-tests.example.com';
    user = await userProvider.createOne({ email });
    org = await orgProvider.createOne({ creatorId: user.id });
    await orgUserProvider.createOne({ orgId: org.id, role: 'owner', userId: user.id });
  });

  afterEach(async () => {
    await userProvider.delete({ email });
  });

  it('#test - Initializes Properly', () => {
    expect(database).toBeDefined();
  });


  describe('#createAccess', () => {
    // if this does not error, it passes because it works
    it('creates a token with access to the user\'s org', async () => {
      const token = await service.createAccess(user);
      await jwtVerify(token, keys.pub, {
        issuer: 'auth-example',
        audience: [ `${org.id}:owner` ],
        subject: user.id,
      });
    });

    it('has a 15 minute expiration', async () => {
      const token = await service.createAccess(user);
      const { payload }: JWTVerifyResult = await jwtVerify(token, keys.pub, {
        issuer: 'auth-example',
        audience: [ `${org.id}:owner` ],
        subject: user.id,
      });

      // verify 15 minute expiry
      const refNow = Date.now();
      const refThen = Moment().add(15, 'minutes').toDate().getTime();
      const ref = Math.round((refThen - refNow) / 1000);
      const iat = payload.iat ?? 0;
      const exp = payload.exp ?? 0;
      const diff = exp - iat;

      expect(diff).toBeGreaterThan(ref - 10);
      expect(diff).toBeLessThan(ref + 10);
    });
  });


  // note: this RELIES on createAccess also passing
  describe('#validateAccess', () => {
    let token: string;

    beforeEach(async () => {
      token = await service.createAccess(user);
    });

    it('validates a proper token', async () => {
      const { payload }: JWTVerifyResult = await service.validateAccess(token);
      expect(payload.nbf)
      expect(payload.aud).toEqual([`${org.id}:owner`]);
      expect(payload.sub).toEqual(user.id);
    });
  });

  describe('#createRefresh', () => {
    it('inserts the refresh tokens into the db', async () => {
      const token = await service.createRefresh(user);
      const unwrapped = await jwtVerify(token, keys.pub, {
        audience: `refresh:${user.id}`,
        subject: user.id,
        issuer: 'auth-example',
      });

      expect(unwrapped.payload.jti).toBeDefined();

      const jti = unwrapped.payload.jti as string;
      const record = await refreshProvider.repo.findOne({ id: jti, userId: user.id });
      expect(record).toBeTruthy()
    });

    it('has a 2 week minute expiration', async () => {
      const token = await service.createRefresh(user);
      const { payload }: JWTVerifyResult = await jwtVerify(token, keys.pub, {
        audience: `refresh:${user.id}`,
        subject: user.id,
        issuer: 'auth-example',
      });

      // verify 2 week expiry
      const refNow = Date.now();
      const refThen = Moment().add(2, 'weeks').toDate().getTime();
      const ref = Math.round((refThen - refNow) / 1000);
      const iat = payload.iat ?? 0;
      const exp = payload.exp ?? 0;
      const diff = exp - iat;

      expect(diff).toBeGreaterThan(ref - 10);
      expect(diff).toBeLessThan(ref + 10);
    });

  });

  describe('#validateRefresh', () => {
    let token: string;

    beforeEach(async () => {
      token = await service.createRefresh(user);
    });

    it('validates a proper token', async () => {
      const { payload }: JWTVerifyResult = await service.validateRefresh(token);
      expect(payload.nbf)
      expect(payload.aud).toEqual(`refresh:${user.id}`);
      expect(payload.sub).toEqual(user.id);
    });
  });
});
