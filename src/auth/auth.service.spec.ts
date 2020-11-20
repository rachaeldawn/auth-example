import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { OrganizationUserModel } from '@app/organization/models/organization-user.model';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test
      .createTestingModule({
        providers: [
          AuthService,
          { provide: getRepositoryToken(OrganizationUserModel), useValue: {} },
        ],
      })
      .compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
