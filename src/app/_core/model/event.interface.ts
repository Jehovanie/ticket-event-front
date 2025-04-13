import { ICategory } from './category.interface';
import { IOrganizer } from './organizer.interface';

export interface IEvent {
  id?: string;
  title?: string;
  description?: string;
  startedAt: Date;
  endAt: Date;
  localisation?: string;
  imageUrl?: string[];
  organizer?: IOrganizer | string;
  category?: ICategory | string;
  status?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
