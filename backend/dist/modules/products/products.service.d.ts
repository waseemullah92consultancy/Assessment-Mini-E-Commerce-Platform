import { Model } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';
export declare class ProductsService {
    private productModel;
    constructor(productModel: Model<ProductDocument>);
    create(createProductDto: CreateProductDto): Promise<ProductDocument>;
    findAll(query: QueryProductsDto): Promise<{
        products: (import("mongoose").Document<unknown, {}, ProductDocument, {}, {}> & Product & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    findOne(id: string): Promise<ProductDocument>;
    update(id: string, updateProductDto: UpdateProductDto): Promise<ProductDocument>;
    remove(id: string): Promise<ProductDocument>;
    findAllAdmin(query: {
        search?: string;
        category?: string;
        isActive?: boolean;
        page?: number;
        limit?: number;
    }): Promise<{
        products: (import("mongoose").Document<unknown, {}, ProductDocument, {}, {}> & Product & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    decrementStock(productId: string, quantity: number): Promise<void>;
    addImageUrl(id: string, imageUrl: string): Promise<ProductDocument>;
    addImageFile(id: string, filename: string): Promise<{
        product: ProductDocument;
        imageUrl: string;
    }>;
}
