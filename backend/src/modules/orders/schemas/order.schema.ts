import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OrderDocument = Order & Document;

export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export enum PaymentStatus {
  UNPAID = 'unpaid',
  PAID = 'paid',
  REFUNDED = 'refunded',
}

@Schema({ timestamps: true })
export class Order {
  @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
  userId: Types.ObjectId;

  @Prop([
    {
      productId: { type: Types.ObjectId, required: true, ref: 'Product' },
      name: { type: String, required: true },
      price: { type: Number, required: true, min: 0 },
      quantity: { type: Number, required: true, min: 1 },
    },
  ])
  items: Array<{
    productId: Types.ObjectId;
    name: string;
    price: number;
    quantity: number;
  }>;

  @Prop({ required: true, min: 0 })
  total: number;

  @Prop({ type: String, enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @Prop({ type: String, enum: PaymentStatus, default: PaymentStatus.UNPAID })
  paymentStatus: PaymentStatus;

  @Prop({ type: String })
  paymentIntentId: string;

  @Prop({
    type: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      country: { type: String, required: true },
    },
  })
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

export const OrderSchema = SchemaFactory.createForClass(Order);

OrderSchema.index({ userId: 1, createdAt: -1 });
