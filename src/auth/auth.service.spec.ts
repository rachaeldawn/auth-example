import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { OrganizationUserModel } from '@app/organization/models/organization-user.model';
import { RefreshTokenModel } from './models/refresh-token.model';
import { PUBLIC_KEY, PRIVATE_KEY } from './auth.constants';
import { UserService } from '@app/user/user.service';
import { ConfigService } from '@app/shared/config.service';
import { SpyObject, createSpyObject } from '@app/testing/spy-object';

describe('AuthService', () => {
  let service: AuthService;
  let conf: SpyObject<ConfigService>;

  beforeEach(async () => {

    conf = createSpyObject(['get']);
    conf.get.mockReturnValue('');

    const module: TestingModule = await Test
      .createTestingModule({
        providers: [
          AuthService,
          { provide: PUBLIC_KEY, useValue: '' },
          { provide: PRIVATE_KEY, useValue: '' },
          { provide: getRepositoryToken(OrganizationUserModel), useValue: {} },
          { provide: getRepositoryToken(RefreshTokenModel), useValue: {} },
          { provide: UserService, useValue: {} },
          { provide: ConfigService, useValue: conf },
        ],
      })
      .compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
