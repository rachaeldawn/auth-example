import { Controller, Post, Body, ConflictException } from '@nestjs/common';
import { RegisterAccount } from './dto/register';
import { OrganizationService } from '@app/organization/organization.service';
import { UserService } from '@app/user/user.service';
import { MessageResponse } from '@app/shared/responses/message';
import { ConfirmDTO } from './dto/confirm';

@Controller('register')
export class RegistrationController {

  constructor(
    private readonly users: UserService,
    private readonly orgs: OrganizationService
  ) {}

  @Post('confirm')
  public async confirm(
    @Body() { token }: ConfirmDTO
  ): Promise<MessageResponse> {
    await this.users.confirmRegistration(token);

    // changing this in the future to be the JWT response
    return new MessageResponse("Registration confirmed. Please log in");
  }

  @Post()
  public async register(
    @Body() { organization, ... body }: RegisterAccount
  ): Promise<MessageResponse> {
    const existing = await this.users.getUser({ email: body.email });
    if (existing?.confirmedAt) {
      throw new ConflictException('Email has already been registered, please log in.')
    }

    const user = await this.users.createUser(body);

    await this.users.createConfirmation(user);
    const org = await this.orgs.create({ name: organization ?? '' }, user.id);
    await this.orgs.addUser({ userId: user.id, orgId: org.id, role: 'owner' });

    // send the confirmation email here

    const msg = 'Registration successful, please check your email to continue';
    return new MessageResponse(msg)
  }

}
