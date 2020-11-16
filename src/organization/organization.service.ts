import { Injectable } from '@nestjs/common';
import { OrganizationModel } from './models/organization.model';
import { CreateOrganization } from './types/create-organization';
import { IGetOrganization } from './types/get-organization';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class OrganizationService {

  constructor(
    @InjectRepository(OrganizationModel)
    private readonly orgRepo: Repository<OrganizationModel>
  ) {}

  /**
   * Create a new organization for a user
   */
  public async create(arg: CreateOrganization, creatorId: string): Promise<OrganizationModel> {
    const creation = await this.orgRepo.create({ ... arg, creatorId });
    console.log(creation);
    await this.orgRepo.createQueryBuilder()
      .insert()
      .values(creation)
      .returning('*')
      .execute();

    return creation;
  }

  public async get(arg: IGetOrganization): Promise<OrganizationModel | undefined> {
    return this.orgRepo.findOne(arg);
  }
}
