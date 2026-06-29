import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument, OrderStatus } from './schemas/order.schema';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(@InjectModel(Order.name) private orderModel: Model<OrderDocument>) {}

  async create(userId: string, createOrderDto: CreateOrderDto): Promise<OrderDocument> {
    const total = createOrderDto.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    const order = new this.orderModel({
      userId: new Types.ObjectId(userId),
      items: createOrderDto.items.map((item) => ({
        ...item,
        productId: new Types.ObjectId(item.productId),
      })),
      total: Math.round(total * 100) / 100,
      shippingAddress: createOrderDto.shippingAddress,
    });

    return order.save();
  }

  async findAllByUser(userId: string): Promise<OrderDocument[]> {
    return this.orderModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 });
  }

  async findAll(): Promise<OrderDocument[]> {
    return this.orderModel.find().sort({ createdAt: -1 });
  }

  async findOne(id: string, userId: string, role: string): Promise<OrderDocument> {
    const order = await this.orderModel.findById(id);
    if (!order) throw new NotFoundException('Order not found');
    if (role !== 'admin' && order.userId.toString() !== userId) {
      throw new ForbiddenException('Access denied');
    }
    return order;
  }

  async updateStatus(id: string, status: OrderStatus): Promise<OrderDocument> {
    const order = await this.orderModel.findByIdAndUpdate(
      id,
      { status },
      { new: true },
    );
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }
}
