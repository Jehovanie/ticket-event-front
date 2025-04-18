export interface IEvent {
  _id?: string;
  title?: string;
  description?: string;
  startedAt: Date;
  endedAt: Date;
  location?: string;
  imageUrl?: string[];
  organisateur?: string;
  category?: string;
  status?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
