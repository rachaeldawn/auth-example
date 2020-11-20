import jwtSign from 'jose/jwt/sign';
import jwtVerify from 'jose/jwt/verify';
import Moment from 'moment';

import { Injectable, Inject } from '@nestjs/common';
import { UserModel } from '@app/user/models/user.model';
import { KeyObject } from 'crypto';
import { OrganizationUserModel } from '@app/organization/models/organization-user.model';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PRIVATE_KEY, PUBLIC_KEY } from './auth.constants';
import { ConfigService } from '@app/shared/config.service';
import { RefreshTokenModel } from './models/refresh-token.model';
import { JWTVerifyResult } from 'jose/webcrypto/types';

@Injectable()
export class AuthService {

  private readonly algo: string;
  
  constructor(
    @Inject(PRIVATE_KEY)
    private readonly privateKey: KeyObject,

    @Inject(PUBLIC_KEY)
    public readonly publicKey: KeyObject,

    @InjectRepository(OrganizationUserModel)
    private readonly seatRepo: Repository<OrganizationUserModel>,

    @InjectRepository(RefreshTokenModel)
    private readonly refreshRepo: Repository<RefreshTokenModel>,

    private readonly conf: ConfigService
  ) {
    this.algo = this.conf.get('AUTH_KEY_ALGO') || 'RS256';
  }

  /**
   * Create an access token that the user is able to use to access the API
   */
  public async createAccess(user: UserModel): Promise<string> {
    // pull org user models
    const orgs = await this.seatRepo
      .createQueryBuilder('link')
      .where('link.userId = :userid', { userid: user.id })
      .getMany();

    const aud = orgs.map(({ orgId, role }) => `${orgId}:${role}`);

    return new jwtSign({})
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
    const record = this.refreshRepo.create({
      expiresAt: Moment().add(2, 'weeks').toDate(),
      userId: user.id,
    });

    await this.refreshRepo.createQueryBuilder()
      .insert()
      .values(record)
      .returning('*')
      .execute();

    return new jwtSign({})
      .setAudience(`refresh:${user.id}`)
      .setExpirationTime('2w')
      .setProtectedHeader({ alg: this.algo })
      .setSubject(user.id)
      .setIssuedAt()
      .setIssuer('auth-example')
      .setJti(record.id)
      .sign(this.privateKey);
  }

  /**
   * Validate an accesss token, returning the user to which it belongs,
   * or error because it is invalid
   */
  public async validateAccess(token: string): Promise<JWTVerifyResult> {
    return jwtVerify(token, this.publicKey, { issuer: 'auth-example' });
  }

  public async validateRefresh(token: string): Promise<JWTVerifyResult> {
    return jwtVerify(token, this.publicKey, { issuer: 'auth-example' });
  }
}
