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
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const product_schema_1 = require("./schemas/product.schema");
const query_products_dto_1 = require("./dto/query-products.dto");
const SORT_MAP = {
    [query_products_dto_1.SortBy.PRICE_ASC]: { price: 1 },
    [query_products_dto_1.SortBy.PRICE_DESC]: { price: -1 },
    [query_products_dto_1.SortBy.NEWEST]: { createdAt: -1 },
};
let ProductsService = class ProductsService {
    constructor(productModel) {
        this.productModel = productModel;
    }
    async create(createProductDto) {
        const product = new this.productModel(createProductDto);
        return product.save();
    }
    async findAll(query) {
        const { search, category, minPrice, maxPrice, sortBy = query_products_dto_1.SortBy.NEWEST, page = 1, limit = 12, } = query;
        const filter = { isActive: true };
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ];
        }
        if (category)
            filter.category = category;
        if (minPrice !== undefined || maxPrice !== undefined) {
            filter.price = {};
            if (minPrice !== undefined)
                filter.price.$gte = minPrice;
            if (maxPrice !== undefined)
                filter.price.$lte = maxPrice;
        }
        const skip = (page - 1) * limit;
        const sort = SORT_MAP[sortBy] ?? { createdAt: -1 };
        const [products, total] = await Promise.all([
            this.productModel.find(filter).skip(skip).limit(limit).sort(sort),
            this.productModel.countDocuments(filter),
        ]);
        return {
            products,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    }
    async findOne(id) {
        const product = await this.productModel.findById(id);
        if (!product || !product.isActive)
            throw new common_1.NotFoundException('Product not found');
        return product;
    }
    async update(id, updateProductDto) {
        const product = await this.productModel.findByIdAndUpdate(id, updateProductDto, { new: true });
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        return product;
    }
    async remove(id) {
        const product = await this.productModel.findByIdAndUpdate(id, { isActive: false }, { new: true });
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        return product;
    }
    async findAllAdmin(query) {
        const { search, category, isActive, page = 1, limit = 50 } = query;
        const filter = {};
        if (isActive !== undefined)
            filter.isActive = isActive;
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ];
        }
        if (category)
            filter.category = category;
        const skip = (page - 1) * limit;
        const [products, total] = await Promise.all([
            this.productModel.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
            this.productModel.countDocuments(filter),
        ]);
        return { products, total, page, totalPages: Math.ceil(total / limit) };
    }
    async decrementStock(productId, quantity) {
        await this.productModel.findByIdAndUpdate(productId, {
            $inc: { stockQuantity: -quantity },
        });
    }
    async addImageUrl(id, imageUrl) {
        const product = await this.productModel.findByIdAndUpdate(id, { $push: { images: imageUrl } }, { new: true });
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        return product;
    }
    async addImageFile(id, filename) {
        const imageUrl = `/uploads/${filename}`;
        const product = await this.productModel.findByIdAndUpdate(id, { $push: { images: imageUrl } }, { new: true });
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        return { product, imageUrl };
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(product_schema_1.Product.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], ProductsService);
//# sourceMappingURL=products.service.js.map