import SignJWT from 'jose/jwt/sign';

import { Injectable, NotImplementedException, Inject } from '@nestjs/common';
import { UserModel } from '@app/user/models/user.model';
import { KeyObject } from 'crypto';
import { OrganizationUserModel } from '@app/organization/models/organization-user.model';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PRIVATE_KEY } from './auth.constants';
import { ConfigService } from '@app/shared/config.service';

@Injectable()
export class AuthService {

  private readonly algo: string;
  
  constructor(
    @Inject(PRIVATE_KEY)
    private readonly privateKey: KeyObject,

    @InjectRepository(OrganizationUserModel)
    private readonly userRepo: Repository<OrganizationUserModel>,

    private readonly conf: ConfigService
  ) {
    this.algo = this.conf.get('AUTH_KEY_ALGO') || 'RS256';
  }

  /**
   * Create an access token that the user is able to use to access the API
   */
  public async createAccess(user: UserModel): Promise<string> {
    // pull org user models
    const orgs = await this.userRepo
      .createQueryBuilder('link')
      .where('link.userId = :userid', { userid: user.id })
      .getMany();

    const aud = orgs.map(({ orgId, role }) => `${orgId}:${role}`);

    return new SignJWT({})
      .setAudience(aud)
      .setExpirationTime('15m')
      .setProtectedHeader({ alg: this.algo })
      .setSubject(user.id)
      .setIssuedAt()
      .setIssuer('auth-example')
      .sign(this.privateKey);
  }

  /**
   * Create a valid refresh token for the user when they need to extend their
   * session beyond the 15 minutes of the access token. These only work one 
   * time.
   */
  public async createRefresh(user: UserModel): Promise<string> {
    throw new NotImplementedException();
  }

  /**
   * Refresh an auth token, erroring if it has passed its expiration
   */
  public async refreshToken(): Promise<string> {
    throw new NotImplementedException();
  }

  /**
   * Validate an accesss token, returning the user to which it belongs,
   * or error because it is invalid
   */
  public async validateAccess(token: string): Promise<UserModel> {
    throw new NotImplementedException();
  }

}
