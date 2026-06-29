import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument, OrderStatus } from './schemas/order.schema';
import { CartService } from '../cart/cart.service';
import { ProductsService } from '../products/products.service';
import { ShippingAddressDto } from './dto/create-order-from-cart.dto';
import { QueryOrdersDto, AdminQueryOrdersDto } from './dto/query-orders.dto';

const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
  [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
  [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED, OrderStatus.CANCELLED],
  [OrderStatus.DELIVERED]: [],
  [OrderStatus.CANCELLED]: [],
};

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private readonly cartService: CartService,
    private readonly productsService: ProductsService,
  ) {}

  async createFromCart(
    userId: string,
    shippingAddress: ShippingAddressDto,
  ): Promise<OrderDocument> {
    // Step 1: get populated cart
    const cart = await this.cartService.getCart(userId);
    const items = cart.items as any[];

    if (!items.length) {
      throw new BadRequestException('Cart is empty');
    }

    // Step 2: validate stock for every item
    for (const item of items) {
      const product = item.productId;
      if (product.stockQuantity < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for "${product.name}". Available: ${product.stockQuantity}`,
        );
      }
    }

    // Step 3: build and persist the order
    const total = items.reduce(
      (sum: number, item: any) => sum + item.productId.price * item.quantity,
      0,
    );

    const order = await this.orderModel.create({
      userId: new Types.ObjectId(userId),
      items: items.map((item: any) => ({
        productId: item.productId._id,
        name: item.productId.name,
        price: item.productId.price,
        quantity: item.quantity,
      })),
      total: Math.round(total * 100) / 100,
      shippingAddress,
      paymentIntentId: `mock_pi_${Date.now()}`,
    });

    // Step 4: decrement stock for each item
    await Promise.all(
      items.map((item: any) =>
        this.productsService.decrementStock(
          item.productId._id.toString(),
          item.quantity,
        ),
      ),
    );

    // Step 5: clear the cart
    await this.cartService.clearCart(userId);

    return order;
  }

  async findAllByUser(userId: string, query: QueryOrdersDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const filter = { userId: new Types.ObjectId(userId) };

    const [orders, total] = await Promise.all([
      this.orderModel.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
      this.orderModel.countDocuments(filter),
    ]);

    return { orders, total, page, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string, userId: string, role: string): Promise<OrderDocument> {
    const order = await this.orderModel.findById(id);
    if (!order) throw new NotFoundException('Order not found');
    if (role !== 'admin' && order.userId.toString() !== userId) {
      throw new ForbiddenException('Access denied');
    }
    return order;
  }

  async findAllAdmin(query: AdminQueryOrdersDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {};
    if (query.status) filter.status = query.status;

    const [orders, total] = await Promise.all([
      this.orderModel
        .find(filter)
        .populate('userId', 'name email')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      this.orderModel.countDocuments(filter),
    ]);

    return { orders, total, page, totalPages: Math.ceil(total / limit) };
  }

  async updateStatus(id: string, nextStatus: OrderStatus): Promise<OrderDocument> {
    const order = await this.orderModel.findById(id);
    if (!order) throw new NotFoundException('Order not found');

    const allowed = ALLOWED_TRANSITIONS[order.status];
    if (!allowed.includes(nextStatus)) {
      throw new BadRequestException(
        `Cannot transition order from "${order.status}" to "${nextStatus}". ` +
          `Allowed: [${allowed.join(', ') || 'none'}]`,
      );
    }

    order.status = nextStatus;
    return order.save();
  }
}
