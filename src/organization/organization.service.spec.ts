import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationService } from './organization.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { OrganizationModel } from './models/organization.model';
import { OrganizationUserModel } from './models/organization-user.model';

describe('OrganizationService', () => {
  let service: OrganizationService;

  beforeEach(async () => {
    const module: TestingModule = await Test
      .createTestingModule({
        providers: [
          OrganizationService,
          { provide: getRepositoryToken(OrganizationUserModel), useValue: {} },
          { provide: getRepositoryToken(OrganizationModel), useValue: {} },
        ],
      })
      .compile();

    service = module.get<OrganizationService>(OrganizationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
