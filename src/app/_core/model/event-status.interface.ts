import { IEvent } from './event.interface';

/**
 * Répartition des tickets renvoyée par `/admin/events/{id}`.
 * Chaque entrée est un objet { nomDuTypeDeTicket: quantité }.
 */
export interface IEventStatusTicket {
  global: { [key: string]: number }[];
  actuel: { [key: string]: number }[];
  filter: {
    time: string;
    value: { [key: string]: number }[];
  };
}

/**
 * Contenu de `events` dans la réponse de `/admin/events/{id}`.
 * Cet endpoint n'utilise pas l'enveloppe `{ message, status, data }`.
 */
export interface IEventStatusDetail {
  event: Partial<IEvent>;
  statusTicket: IEventStatusTicket;
}
