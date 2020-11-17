import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export const UserTable = 'auth.users';

@Entity({ name: 'users', schema: 'auth' })
export class UserModel {

  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({ type: 'integer', nullable: true })
  public age: number | null;

  @Column({ type: 'citext', nullable: false })
  public email: string;

  @Column({ type: 'timestamptz', name: 'created_at', nullable: false })
  public createdAt: Date;

  @Column({ type: 'timestamptz', name: 'updated_at', nullable: false })
  public updatedAt: Date;

  @Column({ type: 'varchar', length: 256, nullable: true })
  public name: string | null;

  @Column({ type: 'timestamptz', name: 'confirmed_at' })
  public confirmedAt: Date | null;

  @Column({ type: 'varchar', length: 60 })
  public password: string
}
