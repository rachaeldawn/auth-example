import { v4 as uuid } from 'uuid';
import { Test, TestingModule } from '@nestjs/testing';
import { RegistrationController } from './registration.controller';
import { SpyObject, createSpyObject } from '@app/testing/spy-object';
import { UserService } from '@app/user/user.service';
import { OrganizationService } from '@app/organization/organization.service';
import { RegisterAccount } from './dto/register';
import { UserModel } from '@app/user/models/user.model';
import { OrganizationModel } from '@app/organization/models/organization.model';
import { MessageResponse } from '@app/shared/responses/message';
import { ConflictException } from '@nestjs/common';

describe('RegistrationController', () => {
  let controller: RegistrationController;

  let userService: SpyObject<UserService>;
  let orgService: SpyObject<OrganizationService>;

  beforeEach(async () => {

    userService = createSpyObject(['createUser', 'getUser', 'createConfirmation']);
    orgService = createSpyObject(['create', 'addUser']);

    const module: TestingModule = await Test
      .createTestingModule({
        providers: [
          { provide: UserService, useValue: userService },
          { provide: OrganizationService, useValue: orgService },
        ],
        controllers: [RegistrationController],
      })
      .compile();

    controller = module.get<RegistrationController>(RegistrationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('#register', () => {
    let dto: RegisterAccount;
    let createdUser: UserModel;
    let createdOrg: OrganizationModel;

    beforeEach(() => {
      dto = new RegisterAccount();
      dto.email = 'test@gmail.com';
      dto.password = 'Password1234!';

      createdUser = new UserModel();
      createdUser.createdAt = new Date();
      createdUser.updatedAt = new Date();
      createdUser.email = dto.email;
      createdUser.id = uuid();

      createdOrg = new OrganizationModel();
      createdOrg.creatorId = createdUser.id;
      createdOrg.id = uuid();
      createdOrg.name = dto.name ?? '';

      userService.getUser.mockResolvedValue(void 0);
      userService.createUser.mockResolvedValue(createdUser);

      orgService.create.mockResolvedValue(createdOrg);
      orgService.addUser.mockResolvedValue({
        userId: createdUser.id,
        orgId: createdOrg.id,
        role: 'owner',
        updatedAt: new Date(),
        createdAt: new Date(),
      });
    });

    it('creates the user', async () => {
      const msg = 'Registration successful, please check your email to continue';
      const message = new MessageResponse(msg)
      const resp = await controller.register(dto);
      expect(resp).toEqual(message);

      const call = { email: dto.email, password: dto.password, name: dto.name, age: dto.age };
      expect(userService.createUser).toHaveBeenCalledWith(call);
    });

    it('creates the org and adds the user', async () => {
      await controller.register(dto);
      
      const orgCall = { name: dto.organization ?? '' };
      const userCall = { userId: createdUser.id, role: 'owner', orgId: createdOrg.id }

      expect(orgService.create).toHaveBeenCalledWith(orgCall, createdUser.id);
      expect(orgService.addUser).toHaveBeenCalledWith(userCall);
    });

    it('creates the account confirmation', async () => {
      await controller.register(dto);
  
      expect(userService.createConfirmation).toHaveBeenCalledWith(createdUser);
    });

    it('errors 409 if user already confirmed', async () => {
      createdUser.confirmedAt = new Date();
      userService.getUser.mockResolvedValue(createdUser);

      try {
        await controller.register(dto);
        throw new Error('Expected a 409 error, got none');
      } catch (err) {
        expect(err).toBeInstanceOf(ConflictException);
      }
    });
  })
});
