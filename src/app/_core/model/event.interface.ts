import { ICategory } from './category.interface';
import { ILocation } from './location.interface';
import { IOrganizer } from './organizer.interface';
import { ITicket } from './ticket.interface';
import { ITicketType } from './ticket-type.interface';

export interface IEvent {
  id?: string;
  title?: string;
  description?: string;
  startedAt: Date;
  endAt: Date;
  imageUrl?: string[];
  status?: string | boolean;
  createdAt?: Date;
  updatedAt?: Date;
  location: ILocation;
  organizer: IOrganizer | string;
  category: ICategory | string;
  tickets?: ITicket[];
  ticket_type?: ITicketType[];
}
