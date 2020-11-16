import { OrganizationRole } from './roles';

export interface IAddUser {
  role: OrganizationRole;
  orgId: string;
  userId: string;
}
