export interface IPaymentTicker {
    _id?: string;
    ticketId?: string;
    userId?: string;
    amount?: number;
    status?: string;
    createdAt?: Date;
    updatedAt?: Date;
}