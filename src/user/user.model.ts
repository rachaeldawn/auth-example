import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'users', schema: 'auth' })
export class UserModel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'citext', nullable: false })
  email: string;

  @Column({
    type: 'timestamptz',
    nullable: false,
    name: 'created_at',
  })
  createdAt: Date;

  @Column({
    type: 'timestamptz',
    nullable: false,
    name: 'updated_at',
  })
  updatedAt: Date;

  @Column({
    type: 'timestamptz',
    nullable: true,
    name: 'confirmed_at',
  })
  confirmedAt: Date | null = null;

  password: string
}
