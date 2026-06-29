import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CartDocument = Cart & Document;

@Schema({ timestamps: true })
export class Cart {
  @Prop({ type: Types.ObjectId, required: true, unique: true, ref: 'User' })
  userId: Types.ObjectId;

  @Prop([
    {
      productId: { type: Types.ObjectId, required: true, ref: 'Product' },
      quantity: { type: Number, required: true, min: 1 },
    },
  ])
  items: Array<{
    productId: Types.ObjectId;
    quantity: number;
  }>;
}

export const CartSchema = SchemaFactory.createForClass(Cart);
