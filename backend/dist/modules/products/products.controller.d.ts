import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    findAll(query: QueryProductsDto): Promise<{
        products: (import("mongoose").Document<unknown, {}, import("./schemas/product.schema").ProductDocument, {}, {}> & import("./schemas/product.schema").Product & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    findOne(id: string): Promise<import("./schemas/product.schema").ProductDocument>;
    create(createProductDto: CreateProductDto): Promise<import("./schemas/product.schema").ProductDocument>;
    update(id: string, updateProductDto: UpdateProductDto): Promise<import("./schemas/product.schema").ProductDocument>;
    remove(id: string): Promise<import("./schemas/product.schema").ProductDocument>;
}
