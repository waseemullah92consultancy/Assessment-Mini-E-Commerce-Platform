import { Document, Types } from 'mongoose';
export type OrderDocument = Order & Document;
export declare enum OrderStatus {
    PENDING = "pending",
    PROCESSING = "processing",
    SHIPPED = "shipped",
    DELIVERED = "delivered",
    CANCELLED = "cancelled"
}
export declare enum PaymentStatus {
    UNPAID = "unpaid",
    PAID = "paid",
    REFUNDED = "refunded"
}
export declare class Order {
    userId: Types.ObjectId;
    items: Array<{
        productId: Types.ObjectId;
        name: string;
        price: number;
        quantity: number;
    }>;
    total: number;
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    paymentIntentId: string;
    shippingAddress: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    };
}
export declare const OrderSchema: import("mongoose").Schema<Order, import("mongoose").Model<Order, any, any, any, Document<unknown, any, Order, any, {}> & Order & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Order, Document<unknown, {}, import("mongoose").FlatRecord<Order>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Order> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
