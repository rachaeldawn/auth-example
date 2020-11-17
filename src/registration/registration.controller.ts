import { Controller, Post, Body, ConflictException } from '@nestjs/common';
import { RegisterAccount } from './dto/register';
import { OrganizationService } from '@app/organization/organization.service';
import { UserService } from '@app/user/user.service';
import { MessageResponse } from '@app/shared/responses/message';
import { ConfirmDTO } from './dto/confirm';
import { UserModel } from '@app/user/models/user.model';

@Controller('register')
export class RegistrationController {

  constructor(
    private readonly users: UserService,
    private readonly orgs: OrganizationService
  ) {}

  @Post('confirm')
  public async confirm(
    @Body() { token }: ConfirmDTO,
  ): Promise<MessageResponse> {
    await this.users.confirmRegistration(token);

    // changing this in the future to be the JWT response
    return new MessageResponse("Registration confirmed. Please log in");
  }

  @Post()
  public async register(
    @Body() body: RegisterAccount,
  ): Promise<MessageResponse> {
    const existing = await this.users.getUser({ email: body.email });
    if (existing?.confirmedAt) {
      throw new ConflictException('Email has already been registered, please log in.')
    }

    if (!existing) {
      return this.registerNew(body);
    }

    return this.registerExisting(existing, body);
  }

  /**
   * Occurs when the user has not confirmed their account, but they have created one.
   * Updated the org name, and all "register" fields. This is only okay to change the
   * email and password because the user has never accessed the software, and as such,
   * there is zero lost information by changing the means through which they access
   * their stuff.
   */
  private async registerExisting(
    user: UserModel,
    { organization, ... arg }: RegisterAccount
  ): Promise<MessageResponse> {
    await this.users.updateUser(user, arg);
    // in theory, there is only 1, so this should get the first
    const org = await this.orgs.get({ creatorId: user.id })
      ?? await this.orgs.create({ name: organization ?? '' }, user.id);

    if (org.name !== organization) {
      await this.orgs.updateName(org, organization ?? '')
    }

    const msg = 'Account re-registered. Please check your email to continue';
    return new MessageResponse(msg);
  }

  /**
   * Register a user for a new account, allowing them access to the software
   */
  private async registerNew(
    { organization, ... arg}: RegisterAccount
  ): Promise<MessageResponse> {
    const user = await this.users.createUser(arg);

    await this.users.createConfirmation(user);
    const org = await this.orgs.create({ name: organization ?? '' }, user.id);
    await this.orgs.addUser({ userId: user.id, orgId: org.id, role: 'owner' });

    // send the confirmation email here

    const msg = 'Registration successful, please check your email to continue';
    return new MessageResponse(msg)
  }

}
