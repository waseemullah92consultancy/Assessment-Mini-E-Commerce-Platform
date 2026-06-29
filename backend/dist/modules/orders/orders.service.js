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
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const order_schema_1 = require("./schemas/order.schema");
const cart_service_1 = require("../cart/cart.service");
const products_service_1 = require("../products/products.service");
const ALLOWED_TRANSITIONS = {
    [order_schema_1.OrderStatus.PENDING]: [order_schema_1.OrderStatus.PROCESSING, order_schema_1.OrderStatus.CANCELLED],
    [order_schema_1.OrderStatus.PROCESSING]: [order_schema_1.OrderStatus.SHIPPED, order_schema_1.OrderStatus.CANCELLED],
    [order_schema_1.OrderStatus.SHIPPED]: [order_schema_1.OrderStatus.DELIVERED, order_schema_1.OrderStatus.CANCELLED],
    [order_schema_1.OrderStatus.DELIVERED]: [],
    [order_schema_1.OrderStatus.CANCELLED]: [],
};
let OrdersService = class OrdersService {
    constructor(orderModel, cartService, productsService) {
        this.orderModel = orderModel;
        this.cartService = cartService;
        this.productsService = productsService;
    }
    async createFromCart(userId, shippingAddress) {
        const cart = await this.cartService.getCart(userId);
        const items = cart.items;
        if (!items.length) {
            throw new common_1.BadRequestException('Cart is empty');
        }
        for (const item of items) {
            const product = item.productId;
            if (product.stockQuantity < item.quantity) {
                throw new common_1.BadRequestException(`Insufficient stock for "${product.name}". Available: ${product.stockQuantity}`);
            }
        }
        const total = items.reduce((sum, item) => sum + item.productId.price * item.quantity, 0);
        const order = await this.orderModel.create({
            userId: new mongoose_2.Types.ObjectId(userId),
            items: items.map((item) => ({
                productId: item.productId._id,
                name: item.productId.name,
                price: item.productId.price,
                quantity: item.quantity,
            })),
            total: Math.round(total * 100) / 100,
            shippingAddress,
            paymentIntentId: `mock_pi_${Date.now()}`,
        });
        await Promise.all(items.map((item) => this.productsService.decrementStock(item.productId._id.toString(), item.quantity)));
        await this.cartService.clearCart(userId);
        return order;
    }
    async findAllByUser(userId, query) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 10;
        const skip = (page - 1) * limit;
        const filter = { userId: new mongoose_2.Types.ObjectId(userId) };
        const [orders, total] = await Promise.all([
            this.orderModel.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
            this.orderModel.countDocuments(filter),
        ]);
        return { orders, total, page, totalPages: Math.ceil(total / limit) };
    }
    async findOne(id, userId, role) {
        const order = await this.orderModel.findById(id);
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        if (role !== 'admin' && order.userId.toString() !== userId) {
            throw new common_1.ForbiddenException('Access denied');
        }
        return order;
    }
    async findAllAdmin(query) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;
        const skip = (page - 1) * limit;
        const filter = {};
        if (query.status)
            filter.status = query.status;
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
    async updateStatus(id, nextStatus) {
        const order = await this.orderModel.findById(id);
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        const allowed = ALLOWED_TRANSITIONS[order.status];
        if (!allowed.includes(nextStatus)) {
            throw new common_1.BadRequestException(`Cannot transition order from "${order.status}" to "${nextStatus}". ` +
                `Allowed: [${allowed.join(', ') || 'none'}]`);
        }
        order.status = nextStatus;
        return order.save();
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(order_schema_1.Order.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        cart_service_1.CartService,
        products_service_1.ProductsService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map