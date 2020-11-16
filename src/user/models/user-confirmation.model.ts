import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ schema: 'auth', name: 'account_confirmations' })
export class UserConfirmationModel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'confirmed_at', type: 'timestamptz', nullable: true })
  confirmedAt: Date | null

  @Column({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @Column({ type: 'varchar', length: 32 })
  token: string;

  @Column({ type: 'citext' })
  email: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;
}
