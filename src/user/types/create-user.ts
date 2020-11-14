import { Exclude, Expose } from 'class-transformer';
import { IsEmail, MinLength, IsString, MaxLength, IsOptional, Min, Max, IsNumber } from 'class-validator';

@Exclude()
export class CreateUser {

  @Expose()
  @IsEmail()
  email: string;

  @Expose()
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password: string;


  @Expose()
  @IsString()
  @IsOptional()
  public name?: string;

  @Expose()
  @IsNumber()
  @Min(13)
  @Max(120)
  public age?: number;
}
