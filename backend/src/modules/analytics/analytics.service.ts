import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument, OrderStatus } from '../orders/schemas/order.schema';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
  ) {}

  async getAnalytics() {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [revenueResult, totalOrders, statusGroups, topProducts, revenueByDay] =
      await Promise.all([
        // Total revenue from delivered orders
        this.orderModel.aggregate([
          { $match: { status: OrderStatus.DELIVERED } },
          { $group: { _id: null, totalRevenue: { $sum: '$total' } } },
        ]),

        // Total order count across all statuses
        this.orderModel.countDocuments(),

        // Order count grouped by status
        this.orderModel.aggregate([
          { $group: { _id: '$status', count: { $sum: 1 } } },
        ]),

        // Top 5 products by units sold (name/price stored in order items)
        this.orderModel.aggregate([
          { $unwind: '$items' },
          {
            $group: {
              _id: '$items.productId',
              name: { $first: '$items.name' },
              totalSold: { $sum: '$items.quantity' },
              revenue: {
                $sum: { $multiply: ['$items.price', '$items.quantity'] },
              },
            },
          },
          { $sort: { totalSold: -1 } },
          { $limit: 5 },
          {
            $project: {
              _id: 0,
              productId: '$_id',
              name: 1,
              totalSold: 1,
              revenue: { $round: ['$revenue', 2] },
            },
          },
        ]),

        // Revenue per day for the last 30 days (delivered orders only)
        this.orderModel.aggregate([
          {
            $match: {
              status: OrderStatus.DELIVERED,
              createdAt: { $gte: thirtyDaysAgo },
            },
          },
          {
            $group: {
              _id: {
                $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
              },
              revenue: { $sum: '$total' },
            },
          },
          { $sort: { _id: 1 } },
          {
            $project: {
              _id: 0,
              date: '$_id',
              revenue: { $round: ['$revenue', 2] },
            },
          },
        ]),
      ]);

    // Reshape status array into a keyed object; default every known status to 0
    const ordersByStatus: Record<string, number> = {
      [OrderStatus.PENDING]: 0,
      [OrderStatus.PROCESSING]: 0,
      [OrderStatus.SHIPPED]: 0,
      [OrderStatus.DELIVERED]: 0,
      [OrderStatus.CANCELLED]: 0,
    };
    for (const { _id, count } of statusGroups) {
      ordersByStatus[_id] = count;
    }

    return {
      totalRevenue: revenueResult[0]?.totalRevenue ?? 0,
      totalOrders,
      ordersByStatus,
      topProducts,
      revenueByDay,
    };
  }
}
