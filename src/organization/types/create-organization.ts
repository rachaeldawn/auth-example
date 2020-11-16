import { IsString } from 'class-validator';
import { Expose, Exclude } from 'class-transformer';

@Exclude()
export class CreateOrganization {
  @Expose()
  @IsString()
  public name: string;
}
