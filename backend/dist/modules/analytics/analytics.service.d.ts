import { Model } from 'mongoose';
import { OrderDocument } from '../orders/schemas/order.schema';
export declare class AnalyticsService {
    private orderModel;
    constructor(orderModel: Model<OrderDocument>);
    getAnalytics(): Promise<{
        totalRevenue: any;
        totalOrders: number;
        ordersByStatus: Record<string, number>;
        topProducts: any[];
        revenueByDay: any[];
    }>;
}
