import { ProductsService } from './products.service';
import { AddImageUrlDto } from './dto/add-image.dto';
export declare class AdminProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    findAll(query: any): Promise<{
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
    addImageUrl(id: string, dto: AddImageUrlDto): Promise<import("./schemas/product.schema").ProductDocument>;
    uploadImage(id: string, file: Express.Multer.File): Promise<{
        product: import("./schemas/product.schema").ProductDocument;
        imageUrl: string;
    }>;
}
