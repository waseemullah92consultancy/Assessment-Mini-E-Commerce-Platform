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
exports.CartService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const cart_schema_1 = require("./schemas/cart.schema");
const products_service_1 = require("../products/products.service");
let CartService = class CartService {
    constructor(cartModel, productsService) {
        this.cartModel = cartModel;
        this.productsService = productsService;
    }
    async getCart(userId) {
        let cart = await this.cartModel
            .findOne({ userId: new mongoose_2.Types.ObjectId(userId) })
            .populate('items.productId');
        if (!cart) {
            cart = await this.cartModel.create({
                userId: new mongoose_2.Types.ObjectId(userId),
                items: [],
            });
        }
        return cart;
    }
    async addItem(userId, dto) {
        const product = await this.productsService.findOne(dto.productId);
        const existingCart = await this.cartModel.findOne({ userId: new mongoose_2.Types.ObjectId(userId) });
        const existingItem = existingCart?.items.find((item) => item.productId.toString() === dto.productId);
        const currentCartQuantity = existingItem ? existingItem.quantity : 0;
        if (currentCartQuantity + dto.quantity > product.stockQuantity) {
            throw new common_1.BadRequestException('Insufficient stock');
        }
        const productObjectId = new mongoose_2.Types.ObjectId(dto.productId);
        if (!existingCart) {
            const cart = await this.cartModel.create({
                userId: new mongoose_2.Types.ObjectId(userId),
                items: [{ productId: productObjectId, quantity: dto.quantity }],
            });
            return this.cartModel.findById(cart._id).populate('items.productId');
        }
        if (existingItem) {
            existingItem.quantity += dto.quantity;
        }
        else {
            existingCart.items.push({ productId: productObjectId, quantity: dto.quantity });
        }
        await existingCart.save();
        return this.cartModel.findById(existingCart._id).populate('items.productId');
    }
    async updateItem(userId, productId, dto) {
        const cart = await this.cartModel.findOne({ userId: new mongoose_2.Types.ObjectId(userId) });
        if (!cart)
            return this.getCart(userId);
        if (dto.quantity === 0) {
            cart.items = cart.items.filter((item) => item.productId.toString() !== productId);
        }
        else {
            const item = cart.items.find((item) => item.productId.toString() === productId);
            if (item)
                item.quantity = dto.quantity;
        }
        await cart.save();
        return this.cartModel.findById(cart._id).populate('items.productId');
    }
    async removeItem(userId, productId) {
        return this.updateItem(userId, productId, { quantity: 0 });
    }
    async clearCart(userId) {
        await this.cartModel.findOneAndUpdate({ userId: new mongoose_2.Types.ObjectId(userId) }, { items: [] });
        return { message: 'Cart cleared' };
    }
};
exports.CartService = CartService;
exports.CartService = CartService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(cart_schema_1.Cart.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        products_service_1.ProductsService])
], CartService);
//# sourceMappingURL=cart.service.js.map