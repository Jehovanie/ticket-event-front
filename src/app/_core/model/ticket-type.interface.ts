export interface ITicketType {
  '@type'?: string;
  '@id'?: string;
  id: number;
  name: string;
  prix: number;
  quantite_max: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}
