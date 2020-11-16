import { Column, Entity, PrimaryColumn } from 'typeorm';
import { OrganizationRole } from '../types/roles';

@Entity({ schema: 'accounts', name: 'users' })
export class OrganizationUserModel {
  @PrimaryColumn({ name: 'user_id', type: 'uuid' })
  userId: string;

  @PrimaryColumn({ name: 'org_id', type: 'uuid' })
  orgId: string;

  @Column({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @Column({ type: "enum", enum: [ 'owner', 'user', 'guest' ] })
  role: OrganizationRole;
}
