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
exports.RecommendationsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const order_schema_1 = require("../orders/schemas/order.schema");
const product_schema_1 = require("../products/schemas/product.schema");
let RecommendationsService = class RecommendationsService {
    constructor(orderModel, productModel) {
        this.orderModel = orderModel;
        this.productModel = productModel;
    }
    async getProductRecommendations(productId) {
        const productObjectId = new mongoose_2.Types.ObjectId(productId);
        const product = await this.productModel.findById(productObjectId).lean();
        if (!product || !product.isActive)
            return [];
        const coResults = await this.orderModel.aggregate([
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
        if (coResults.length >= 4)
            return coResults;
        const needed = 4 - coResults.length;
        const excludeIds = [productObjectId, ...coResults.map((r) => r._id)];
        const fallback = await this.productModel.aggregate([
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
    async getPersonalized(userId) {
        const userObjectId = new mongoose_2.Types.ObjectId(userId);
        const recentOrders = await this.orderModel
            .find({ userId: userObjectId })
            .sort({ createdAt: -1 })
            .limit(3)
            .lean();
        if (!recentOrders.length)
            return [];
        const purchasedIds = recentOrders.flatMap((order) => order.items.map((item) => item.productId));
        const recommendations = await this.orderModel.aggregate([
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
};
exports.RecommendationsService = RecommendationsService;
exports.RecommendationsService = RecommendationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(order_schema_1.Order.name)),
    __param(1, (0, mongoose_1.InjectModel)(product_schema_1.Product.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], RecommendationsService);
//# sourceMappingURL=recommendations.service.js.map