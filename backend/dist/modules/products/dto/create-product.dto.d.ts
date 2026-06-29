import { ProductCategory } from '../schemas/product.schema';
export declare class CreateProductDto {
    name: string;
    description: string;
    price: number;
    images?: string[];
    category: ProductCategory;
    stockQuantity: number;
    isActive?: boolean;
}
