export interface IUser {
  id: string;
  age: number | null;
  email: string;
  created_at: Date;
  updated_at: Date;
  name: string | null;
  confirmed_at: Date | null;
  password: string;
}
