/** Utilisateur tel que renvoyé par `/api/auth/register` et `/api/user/me`. */
export interface IUser {
  id?: number | string;
  email?: string;
  firstname?: string;
  lastname?: string;
  phone?: string | null;
  language?: string | null;
  roles?: string[];
  createdAt?: string;
  updatedAt?: string;
}
