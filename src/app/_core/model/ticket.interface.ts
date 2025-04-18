import { IStatus, ITypeTicket } from '../../_utils/type';

export interface ITicket {
  id: string;
  name: string;
  type: ITypeTicket;
  price?: number;
  eventId: string;
  code: string;
  status?: IStatus;
}
