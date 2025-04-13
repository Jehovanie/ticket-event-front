import { IStatus, ITypeTicket } from '../../_utils/type';

export interface ITicket {
  id?: string;
  eventId?: string;
  code?: string;
  type: ITypeTicket;
  price?: number;
  status?: IStatus;
}
