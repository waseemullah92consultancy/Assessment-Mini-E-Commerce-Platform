import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cart, CartDocument } from './schemas/cart.schema';
import { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';
import { ProductsService } from '../products/products.service';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
    private readonly productsService: ProductsService,
  ) {}

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
    const product = await this.productsService.findOne(dto.productId);

    const existingCart = await this.cartModel.findOne({ userId: new Types.ObjectId(userId) });
    const existingItem = existingCart?.items.find(
      (item) => item.productId.toString() === dto.productId,
    );
    const currentCartQuantity = existingItem ? existingItem.quantity : 0;

    if (currentCartQuantity + dto.quantity > product.stockQuantity) {
      throw new BadRequestException('Insufficient stock');
    }

    const productObjectId = new Types.ObjectId(dto.productId);

    if (!existingCart) {
      const cart = await this.cartModel.create({
        userId: new Types.ObjectId(userId),
        items: [{ productId: productObjectId, quantity: dto.quantity }],
      });
      return this.cartModel.findById(cart._id).populate('items.productId');
    }

    if (existingItem) {
      existingItem.quantity += dto.quantity;
    } else {
      existingCart.items.push({ productId: productObjectId, quantity: dto.quantity });
    }
    await existingCart.save();

    return this.cartModel.findById(existingCart._id).populate('items.productId');
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
