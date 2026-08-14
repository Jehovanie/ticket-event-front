export interface IPaymentTicket {
    id?: string;
    ticketId?: string;
    userId?: string;
    amount?: number;
    status?: string;
    createdAt?: Date;
    updatedAt?: Date;
}