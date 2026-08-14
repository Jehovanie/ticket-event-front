/**
 * Enveloppe standard des réponses de l'API TicketUp.
 * Le corps utile se trouve toujours dans `data`, jamais à la racine.
 */
export interface IApiResponse<T> {
  message: string;
  status: number;
  data: T;
}

/**
 * Bloc de pagination renvoyé par l'API dans `data`.
 * Attention : `currentPage` est indexée à partir de 1 côté serveur.
 */
export interface IPaginated<T> {
  itemsTotal: number;
  currentPage: number;
  nombreParPage: number;
  items: T[];
}

/**
 * Collection au format Hydra / API Platform (endpoints `/organizers`, `/locations`).
 * Forme différente de `IApiResponse` : les éléments sont dans `member`.
 */
export interface IHydraCollection<T> {
  totalItems: number;
  member: T[];
}
