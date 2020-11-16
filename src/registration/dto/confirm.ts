import { Length } from 'class-validator';
import { Expose, Exclude } from 'class-transformer';

@Exclude()
export class ConfirmDTO {

  @Expose()
  @Length(32)
  public token: string;
}
