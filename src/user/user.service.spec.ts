import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserModel } from './models/user.model';
import { UserConfirmationModel } from './models/user-confirmation.model';

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test
      .createTestingModule({
        providers: [
          // blank because we're just testing non-repo things
          { provide: getRepositoryToken(UserModel), useValue: {} },
          { provide: getRepositoryToken(UserConfirmationModel), useValue: {} },
          UserService,
        ],
      })
      .compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('#createPassword', () => {
    it('should hash a string', async () => {
      const pwd = "mount wannahuckaloogie";
      const res = await service.createPassword(pwd)
      expect(res).not.toEqual(pwd);
      expect(res.length).toEqual(60);
    });
  })
});
