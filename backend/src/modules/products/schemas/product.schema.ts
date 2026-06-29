import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProductDocument = Product & Document;

export enum ProductCategory {
  ELECTRONICS = 'Electronics',
  CLOTHING = 'Clothing',
  BOOKS = 'Books',
  HOME = 'Home',
  SPORTS = 'Sports',
}

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ type: String, enum: ProductCategory, required: true })
  category: ProductCategory;

  @Prop({ required: true, min: 0, default: 0 })
  stockQuantity: number;

  @Prop({ default: true })
  isActive: boolean;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

ProductSchema.index({ name: 'text', description: 'text' });
ProductSchema.index({ category: 1 });
ProductSchema.index({ price: 1 });
