"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const order_schema_1 = require("../orders/schemas/order.schema");
let AnalyticsService = class AnalyticsService {
    constructor(orderModel) {
        this.orderModel = orderModel;
    }
    async getAnalytics() {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const [revenueResult, totalOrders, statusGroups, topProducts, revenueByDay] = await Promise.all([
            this.orderModel.aggregate([
                { $match: { status: order_schema_1.OrderStatus.DELIVERED } },
                { $group: { _id: null, totalRevenue: { $sum: '$total' } } },
            ]),
            this.orderModel.countDocuments(),
            this.orderModel.aggregate([
                { $group: { _id: '$status', count: { $sum: 1 } } },
            ]),
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
            this.orderModel.aggregate([
                {
                    $match: {
                        status: order_schema_1.OrderStatus.DELIVERED,
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
        const ordersByStatus = {
            [order_schema_1.OrderStatus.PENDING]: 0,
            [order_schema_1.OrderStatus.PROCESSING]: 0,
            [order_schema_1.OrderStatus.SHIPPED]: 0,
            [order_schema_1.OrderStatus.DELIVERED]: 0,
            [order_schema_1.OrderStatus.CANCELLED]: 0,
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
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(order_schema_1.Order.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map