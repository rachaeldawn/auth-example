import { Controller, Post, Body, ConflictException } from '@nestjs/common';
import { RegisterAccount } from './dto/register';
import { OrganizationService } from '@app/organization/organization.service';
import { UserService } from '@app/user/user.service';
import { MessageResponse } from '@app/shared/responses/message';

@Controller('register')
export class RegistrationController {

  constructor(
    private readonly users: UserService,
    private readonly orgs: OrganizationService
  ) {}

  @Post()
  public async register(
    @Body() body: RegisterAccount
  ): Promise<MessageResponse> {
    const existing = await this.users.getUser({ email: body.email });
    if (existing?.confirmedAt) {
      throw new ConflictException('Email has already been registered, please log in.')
    }

    const user = await this.users.createUser({
      age: body.age,
      email: body.email,
      name: body.name,
      password: body.password,
    });

    await this.users.createConfirmation(user);
    const org = await this.orgs.create({ name: body.organization ?? '' }, user.id);
    await this.orgs.addUser({ userId: user.id, orgId: org.id, role: 'owner' });

    const msg = 'Registration successful, please check your email to continue';
    return new MessageResponse(msg)
  }
}
