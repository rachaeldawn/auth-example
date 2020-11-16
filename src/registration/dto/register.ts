import { IsEmail, MinLength, MaxLength, IsString, Min, Max, IsNumber, IsOptional } from 'class-validator';
import { Expose, Exclude } from 'class-transformer';

@Exclude()
export class RegisterAccount {
  @IsEmail()
  @Expose()
  public email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  public password: string;

  @IsString()
  @IsOptional()
  public name?: string;

  @IsNumber()
  @Min(12)
  @Max(140)
  public age?: number;

  @IsString()
  @IsOptional()
  public organization?: string;
}
