import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';

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
    const { search, category, minPrice, maxPrice, page = 1, limit = 12 } = query;
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
    const [products, total] = await Promise.all([
      this.productModel.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
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

  async remove(id: string): Promise<void> {
    const result = await this.productModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundException('Product not found');
  }

  async decrementStock(productId: string, quantity: number): Promise<void> {
    await this.productModel.findByIdAndUpdate(productId, {
      $inc: { stockQuantity: -quantity },
    });
  }
}
