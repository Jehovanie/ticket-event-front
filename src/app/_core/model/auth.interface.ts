import { IUser } from './user.interface';

/** Corps attendu par `POST /api/auth/login` (firewall `json_login`). */
export interface ILoginPayload {
  email: string;
  password: string;
}

/**
 * Corps attendu par `POST /api/auth/register`.
 * Contraintes côté API (`RegisterDTO`) : email valide, mot de passe de 4 à 72
 * caractères, prénom et nom obligatoires (50 max), téléphone 30 max.
 */
export interface IRegisterPayload {
  email: string;
  password: string;
  firstname: string;
  lastname: string;
  phone?: string | null;
  language?: string | null;
}

/** Réponse du login : le refresh token est ajouté par `JwtLoginSuccessSubscriber`. */
export interface IAuthTokens {
  token: string;
  refresh_token: string;
}

/** L'inscription renvoie en plus l'utilisateur créé : pas besoin d'un appel `/me`. */
export interface IRegisterResponse extends IAuthTokens {
  user: IUser;
}
