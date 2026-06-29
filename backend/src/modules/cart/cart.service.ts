import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cart, CartDocument } from './schemas/cart.schema';
import { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';

@Injectable()
export class CartService {
  constructor(@InjectModel(Cart.name) private cartModel: Model<CartDocument>) {}

  async getCart(userId: string): Promise<CartDocument> {
    let cart = await this.cartModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .populate('items.productId');

    if (!cart) {
      cart = await this.cartModel.create({
        userId: new Types.ObjectId(userId),
        items: [],
      });
    }
    return cart;
  }

  async addItem(userId: string, dto: AddToCartDto): Promise<CartDocument> {
    const productObjectId = new Types.ObjectId(dto.productId);
    let cart = await this.cartModel.findOne({ userId: new Types.ObjectId(userId) });

    if (!cart) {
      cart = await this.cartModel.create({
        userId: new Types.ObjectId(userId),
        items: [{ productId: productObjectId, quantity: dto.quantity }],
      });
    } else {
      const existingItem = cart.items.find(
        (item) => item.productId.toString() === dto.productId,
      );
      if (existingItem) {
        existingItem.quantity += dto.quantity;
      } else {
        cart.items.push({ productId: productObjectId, quantity: dto.quantity });
      }
      await cart.save();
    }

    return this.cartModel.findById(cart._id).populate('items.productId');
  }

  async updateItem(
    userId: string,
    productId: string,
    dto: UpdateCartItemDto,
  ): Promise<CartDocument> {
    const cart = await this.cartModel.findOne({ userId: new Types.ObjectId(userId) });
    if (!cart) return this.getCart(userId);

    if (dto.quantity === 0) {
      cart.items = cart.items.filter(
        (item) => item.productId.toString() !== productId,
      ) as any;
    } else {
      const item = cart.items.find((item) => item.productId.toString() === productId);
      if (item) item.quantity = dto.quantity;
    }

    await cart.save();
    return this.cartModel.findById(cart._id).populate('items.productId');
  }

  async removeItem(userId: string, productId: string): Promise<CartDocument> {
    return this.updateItem(userId, productId, { quantity: 0 });
  }

  async clearCart(userId: string): Promise<{ message: string }> {
    await this.cartModel.findOneAndUpdate(
      { userId: new Types.ObjectId(userId) },
      { items: [] },
    );
    return { message: 'Cart cleared' };
  }
}
