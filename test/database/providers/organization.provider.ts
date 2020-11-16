import { DatabaseProvider, ProvideModels } from '../provider';
import { OrganizationModel } from '@app/organization/models/organization.model';
import { Repository } from 'typeorm';

export interface IOneOrganization {
  name?: string;
  creatorId: string;
}

@ProvideModels(OrganizationModel)
export class OrganizationProvider extends DatabaseProvider<OrganizationModel> {

  public get repo(): Repository<OrganizationModel> {
    return this.db.repo(OrganizationModel);
  }

  public async createOne({ name, creatorId }: IOneOrganization): Promise<OrganizationModel> {
    const created = this.repo.create({ name: name ?? '', creatorId });
    await this.repo.createQueryBuilder()
      .insert()
      .values(created)
      .returning('*')
      .execute();

    return created;
  }

  public async createMany(...args: IOneOrganization[]): Promise<OrganizationModel[]> {
    const created = this.repo.create(args);
    await this.repo.createQueryBuilder()
      .insert()
      .values(created)
      .returning('*')
      .execute();

    return created;
  }
}
