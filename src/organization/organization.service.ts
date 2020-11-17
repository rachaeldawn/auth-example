import { Injectable, NotFoundException } from '@nestjs/common';
import { OrganizationModel } from './models/organization.model';
import { CreateOrganization } from './types/create-organization';
import { IGetOrganization } from './types/get-organization';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IAddUser } from './types/add-user';
import { OrganizationUserModel } from './models/organization-user.model';

@Injectable()
export class OrganizationService {

  constructor(
    @InjectRepository(OrganizationModel)
    private readonly orgRepo: Repository<OrganizationModel>,

    @InjectRepository(OrganizationUserModel)
    private readonly orgUserRepo: Repository<OrganizationUserModel>,
  ) { }

  public async addUser({ userId, orgId, role }: IAddUser): Promise<OrganizationUserModel> {
    const org = await this.get({ id: orgId });
    if (org == null) {
      const err = `Unable to find organization with id: ${orgId}`
      throw new NotFoundException(err);
    }

    const user = await this.orgUserRepo.findOne({ orgId, userId });
    if (user != null) return user;

    const created = this.orgUserRepo.create({ userId, orgId, role });
    await this.orgUserRepo.createQueryBuilder()
      .insert()
      .values(created)
      .returning('*')
      .execute();

    return created;
  }

  /**
   * Create a new organization for a user
   */
  public async create(arg: CreateOrganization, creatorId: string): Promise<OrganizationModel> {
    const creation = await this.orgRepo.create({ ... arg, creatorId });
    await this.orgRepo.createQueryBuilder()
      .insert()
      .values(creation)
      .returning('*')
      .execute();

    return creation;
  }

  /**
   * Get a single Organization by a unique identifier
   */
  public async get(arg: IGetOrganization): Promise<OrganizationModel | undefined> {
    return this.orgRepo.findOne(arg);
  }

  public async updateName(org: OrganizationModel, name: string): Promise<OrganizationModel> {
    org.name = name;

    return this.orgRepo.save(org, { reload: true });
  }
}
