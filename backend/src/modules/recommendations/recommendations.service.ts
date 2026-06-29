/**
 * Recommendation algorithm overview
 * ----------------------------------
 * Product recommendations (getProductRecommendations):
 *   1. Co-occurrence: scan orders that contain the target product, unwind items,
 *      count how often each other product appears in the same order, return the
 *      top 4 active + in-stock products sorted by frequency.
 *   2. Category fallback: if fewer than 4 co-occurrence results are found, fill
 *      remaining slots from the same product category.  Products are sorted by
 *      their total units sold (left-joined from orders) so higher-selling items
 *      surface first even when they have never been co-purchased.
 *
 * Personalized recommendations (getPersonalized):
 *   1. Collect all productIds from the user's last 3 orders.
 *   2. Find orders that contain any of those products (broad co-occurrence seed).
 *   3. Unwind items, exclude already-purchased productIds, group by productId
 *      and count frequency.
 *   4. Join with the products collection; filter to active + in-stock; return
 *      up to 8, highest-frequency first.
 *
 * All counting and sorting is performed inside MongoDB aggregation pipelines —
 * no statistics are computed in application code.
 */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument } from '../orders/schemas/order.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';

@Injectable()
export class RecommendationsService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async getProductRecommendations(productId: string): Promise<any[]> {
    const productObjectId = new Types.ObjectId(productId);

    const product = await this.productModel.findById(productObjectId).lean();
    if (!product || !product.isActive) return [];

    // ---- Co-occurrence pass ------------------------------------------------
    const coResults: any[] = await this.orderModel.aggregate([
      { $match: { 'items.productId': productObjectId } },
      { $unwind: '$items' },
      { $match: { 'items.productId': { $ne: productObjectId } } },
      { $group: { _id: '$items.productId', score: { $sum: 1 } } },
      { $sort: { score: -1 } },
      { $limit: 20 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productData',
        },
      },
      { $unwind: '$productData' },
      {
        $match: {
          'productData.isActive': true,
          'productData.stockQuantity': { $gt: 0 },
        },
      },
      {
        $project: {
          _id: '$productData._id',
          name: '$productData.name',
          price: '$productData.price',
          images: '$productData.images',
          category: '$productData.category',
          stockQuantity: '$productData.stockQuantity',
          score: 1,
        },
      },
      { $limit: 4 },
    ]);

    if (coResults.length >= 4) return coResults;

    // ---- Category fallback -------------------------------------------------
    const needed = 4 - coResults.length;
    const excludeIds = [productObjectId, ...coResults.map((r) => r._id)];

    const fallback: any[] = await this.productModel.aggregate([
      {
        $match: {
          category: product.category,
          isActive: true,
          stockQuantity: { $gt: 0 },
          _id: { $nin: excludeIds },
        },
      },
      {
        $lookup: {
          from: 'orders',
          let: { pid: '$_id' },
          pipeline: [
            { $unwind: '$items' },
            {
              $match: {
                $expr: { $eq: ['$items.productId', '$$pid'] },
              },
            },
            {
              $group: { _id: null, totalSold: { $sum: '$items.quantity' } },
            },
          ],
          as: 'orderData',
        },
      },
      {
        $addFields: {
          score: {
            $ifNull: [{ $arrayElemAt: ['$orderData.totalSold', 0] }, 0],
          },
        },
      },
      { $sort: { score: -1 } },
      {
        $project: {
          _id: 1,
          name: 1,
          price: 1,
          images: 1,
          category: 1,
          stockQuantity: 1,
          score: 1,
        },
      },
      { $limit: needed },
    ]);

    return [...coResults, ...fallback];
  }

  async getPersonalized(userId: string): Promise<any[]> {
    const userObjectId = new Types.ObjectId(userId);

    // Last 3 orders for this user
    const recentOrders = await this.orderModel
      .find({ userId: userObjectId })
      .sort({ createdAt: -1 })
      .limit(3)
      .lean();

    if (!recentOrders.length) return [];

    const purchasedIds = recentOrders.flatMap((order) =>
      order.items.map((item) => item.productId),
    );

    // Co-occurrence seeded from all purchased products; exclude already bought
    const recommendations: any[] = await this.orderModel.aggregate([
      { $match: { 'items.productId': { $in: purchasedIds } } },
      { $unwind: '$items' },
      { $match: { 'items.productId': { $nin: purchasedIds } } },
      { $group: { _id: '$items.productId', score: { $sum: 1 } } },
      { $sort: { score: -1 } },
      { $limit: 30 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productData',
        },
      },
      { $unwind: '$productData' },
      {
        $match: {
          'productData.isActive': true,
          'productData.stockQuantity': { $gt: 0 },
        },
      },
      {
        $project: {
          _id: '$productData._id',
          name: '$productData.name',
          price: '$productData.price',
          images: '$productData.images',
          category: '$productData.category',
          stockQuantity: '$productData.stockQuantity',
          score: 1,
        },
      },
      { $limit: 8 },
    ]);

    return recommendations;
  }
}
