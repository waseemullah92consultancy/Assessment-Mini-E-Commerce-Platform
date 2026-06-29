import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductsDto, SortBy } from './dto/query-products.dto';

const SORT_MAP = {
  [SortBy.PRICE_ASC]: { price: 1 as const },
  [SortBy.PRICE_DESC]: { price: -1 as const },
  [SortBy.NEWEST]: { createdAt: -1 as const },
} as const;

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<ProductDocument> {
    const product = new this.productModel(createProductDto);
    return product.save();
  }

  async findAll(query: QueryProductsDto) {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      sortBy = SortBy.NEWEST,
      page = 1,
      limit = 12,
    } = query;

    const filter: Record<string, any> = { isActive: true };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (category) filter.category = category;
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = minPrice;
      if (maxPrice !== undefined) filter.price.$lte = maxPrice;
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

  async findOne(id: string): Promise<ProductDocument> {
    const product = await this.productModel.findById(id);
    if (!product || !product.isActive) throw new NotFoundException('Product not found');
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<ProductDocument> {
    const product = await this.productModel.findByIdAndUpdate(
      id,
      updateProductDto,
      { new: true },
    );
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async remove(id: string): Promise<ProductDocument> {
    const product = await this.productModel.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true },
    );
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async findAllAdmin(query: {
    search?: string;
    category?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }) {
    const { search, category, isActive, page = 1, limit = 50 } = query;
    const filter: Record<string, any> = {};
    if (isActive !== undefined) filter.isActive = isActive;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (category) filter.category = category;
    const skip = (page - 1) * limit;
    const [products, total] = await Promise.all([
      this.productModel.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
      this.productModel.countDocuments(filter),
    ]);
    return { products, total, page, totalPages: Math.ceil(total / limit) };
  }

  async decrementStock(productId: string, quantity: number): Promise<void> {
    await this.productModel.findByIdAndUpdate(productId, {
      $inc: { stockQuantity: -quantity },
    });
  }

  async addImageUrl(id: string, imageUrl: string): Promise<ProductDocument> {
    const product = await this.productModel.findByIdAndUpdate(
      id,
      { $push: { images: imageUrl } },
      { new: true },
    );
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async addImageFile(
    id: string,
    filename: string,
  ): Promise<{ product: ProductDocument; imageUrl: string }> {
    const imageUrl = `/uploads/${filename}`;
    const product = await this.productModel.findByIdAndUpdate(
      id,
      { $push: { images: imageUrl } },
      { new: true },
    );
    if (!product) throw new NotFoundException('Product not found');
    return { product, imageUrl };
  }
}
