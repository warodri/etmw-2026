import { UserModel } from "./user"

export interface SubscriptionModel {

    _id: string,
    userId: UserModel,
    plan: 'explorer' | 'reader' | 'unlimited',
    booksPerMonth: number,
    periodStart: number,
    periodEnd: number,
    status: 'active' | 'paused' | 'canceled' | 'expired',
    region: string,   // EU, LATAM, etc.
    currency: string,
    price: number,   // snapshot at purchase time
    provider: string,  // stripe, mercadopago, etc.
    createdAt: number,
    updatedAt: number

}