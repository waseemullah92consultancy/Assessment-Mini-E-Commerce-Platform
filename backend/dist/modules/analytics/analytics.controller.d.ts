import { AnalyticsService } from './analytics.service';
export declare class AnalyticsController {
    private readonly analyticsService;
    constructor(analyticsService: AnalyticsService);
    getAnalytics(): Promise<{
        totalRevenue: any;
        totalOrders: number;
        ordersByStatus: Record<string, number>;
        topProducts: any[];
        revenueByDay: any[];
    }>;
}
