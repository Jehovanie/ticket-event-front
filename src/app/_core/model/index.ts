import { IApiResponse, IHydraCollection, IPaginated } from "./api-response.interface";
import {
  IAuthTokens,
  ILoginPayload,
  IRegisterPayload,
  IRegisterResponse,
} from "./auth.interface";
import { ICategory } from "./category.interface";
import { IEvent } from "./event.interface";
import { IEventStatusDetail, IEventStatusTicket } from "./event-status.interface";
import { IOrganizer } from "./organizer.interface";
import {ILocation } from "./location.interface";
import { IPaymentTicket } from "./payment_ticket.interface";
import { ITicket } from "./ticket.interface";
import { ITicketType } from "./ticket-type.interface";
import { IUser } from "./user.interface";


export type {
  IApiResponse,
  IAuthTokens,
  ICategory,
  IEvent,
  IEventStatusDetail,
  IEventStatusTicket,
  IHydraCollection,
  ILocation,
  ILoginPayload,
  IOrganizer,
  IPaginated,
  IPaymentTicket,
  IRegisterPayload,
  IRegisterResponse,
  ITicket,
  ITicketType,
  IUser
};
