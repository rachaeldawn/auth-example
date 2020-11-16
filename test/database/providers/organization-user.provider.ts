import { DatabaseProvider, ProvideModels } from '../provider';
import { Repository } from 'typeorm';
import { OrganizationRole } from '@app/organization/types/roles';
import { OrganizationUserModel } from '@app/organization/models/organization-user.model';

export interface IOneOrgUser {
  userId: string;
  orgId: string;
  role: OrganizationRole;
}

@ProvideModels(OrganizationUserModel)
export class OrganizationUserProvider extends DatabaseProvider<OrganizationUserModel> {

  public get repo(): Repository<OrganizationUserModel> {
    return this.db.repo(OrganizationUserModel);
  }

  public async createOne(arg: IOneOrgUser): Promise<OrganizationUserModel> {
    const created = this.repo.create(arg);
    await this.repo.createQueryBuilder()
      .insert()
      .values(created)
      .returning('*')
      .execute();

    return created;
  }

  public async createMany(...args: IOneOrgUser[]): Promise<OrganizationUserModel[]> {
    const created = this.repo.create(args);
    await this.repo.createQueryBuilder()
      .insert()
      .values(created)
      .returning('*')
      .execute();

    return created;
  }
}
