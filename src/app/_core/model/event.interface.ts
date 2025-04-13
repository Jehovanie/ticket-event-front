import { ICategory } from './category.interface';
import { ILocation } from './location.interface';
import { IOrganizer } from './organizer.interface';

export interface IEvent {
  id?: string;
  title?: string;
  description?: string;
  startedAt: Date;
  endAt: Date;
  location: ILocation;
  imageUrl: string[];
  organizer: IOrganizer | string;
  category: ICategory | string;
  status?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
