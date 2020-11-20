import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ schema: 'auth', name: 'refresh_tokens' })
export class RefreshTokenModel {
  
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({ type: 'uuid', name: 'user_id', nullable: true })
  public userId: string;

  @Column({ type: 'timestamptz', name: 'used_at', nullable: true })
  public usedAt: Date | null;

  @Column({ type: 'timestamptz', name: 'expires_at', nullable: false })
  public expiresAt: Date;

}
